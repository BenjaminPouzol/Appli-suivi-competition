import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Matchs } from './matchs';
import { MatchApi } from '../../modeles/match';
import { Competition } from '../../modeles/competition';
import { fabriquerJeton } from '../../../testing/jetons-de-test';

const URL_MATCHS = 'http://localhost:3000/api/matchs';
const URL_COMPETITIONS = 'http://localhost:3000/api/competitions';

describe('Matchs', () => {
  let component: Matchs;
  let fixture: ComponentFixture<Matchs>;
  let httpMock: HttpTestingController;

  const KC = { id: 'kc', nom: 'Karmine Corp', trigramme: 'KC' };
  const G2 = { id: 'g2', nom: 'G2 Esports', trigramme: 'G2' };

  const matchsApi: MatchApi[] = [
    {
      id: 'm1',
      competitionId: 'lol',
      domicile: KC,
      exterieur: G2,
      scoreDomicile: 1,
      scoreExterieur: 0,
      date: '2026-09-14T17:00:00.000Z',
      statut: 'en-direct',
    },
    {
      id: 'm2',
      competitionId: 'lol',
      domicile: G2,
      exterieur: KC,
      scoreDomicile: null,
      scoreExterieur: null,
      date: '2026-09-15T18:00:00.000Z',
      statut: 'a-venir',
    },
  ];

  const competitionsApi: Competition[] = [
    { id: 'lol', nom: 'League of Legends', organisateur: 'Riot', univers: 'esport', description: '' },
  ];

  /** Satisfait les deux requetes lancees en parallele par forkJoin. */
  function repondreAuxDeuxRequetes(): void {
    httpMock.expectOne(URL_MATCHS).flush(matchsApi);
    httpMock.expectOne(URL_COMPETITIONS).flush(competitionsApi);
  }

  beforeEach(async () => {
    // Etape 8 : personne de connecte par defaut.
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [Matchs],
      // Etape 7 : la page contient des liens routerLink, qui ont besoin du routeur.
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Matchs);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    repondreAuxDeuxRequetes();
  });

  it('lance les deux requetes en parallele', () => {
    // Les deux sont deja parties : forkJoin ne les enchaine pas.
    httpMock.expectOne(URL_MATCHS).flush(matchsApi);
    httpMock.expectOne(URL_COMPETITIONS).flush(competitionsApi);
    httpMock.verify();
  });

  it('repartit les matchs par statut une fois les deux reponses recues', async () => {
    repondreAuxDeuxRequetes();
    await fixture.whenStable();

    expect(component.chargement()).toBe(false);
    expect(component.matchsEnDirect().length).toBe(1);
    expect(component.matchsAVenir().length).toBe(1);
    expect(component.matchsTermines().length).toBe(0);
  });

  it('traduit un identifiant de competition en nom lisible', async () => {
    repondreAuxDeuxRequetes();
    await fixture.whenStable();

    expect(component.nomCompetition('lol')).toBe('League of Legends');
    expect(component.nomCompetition('inexistant')).toBe('Compétition inconnue');
  });

  it('signale une erreur si l\'une des deux requetes echoue', async () => {
    httpMock.expectOne(URL_MATCHS).flush(matchsApi);
    httpMock
      .expectOne(URL_COMPETITIONS)
      .flush('Indisponible', { status: 500, statusText: 'Erreur interne' });
    await fixture.whenStable();

    expect(component.chargement()).toBe(false);
    expect(component.erreur()).not.toBeNull();
  });

  describe("actions d'edition (etape 8)", () => {
    function page(): HTMLElement {
      return fixture.nativeElement as HTMLElement;
    }

    it('les masque a une personne anonyme', async () => {
      repondreAuxDeuxRequetes();
      await fixture.whenStable();

      expect(page().textContent).not.toContain('Nouveau match');
      expect(page().querySelectorAll('.lien-modifier').length).toBe(0);
    });

    it('les affiche a un administrateur', async () => {
      // Le service de session lit le stockage a sa creation : on repart d'un
      // module de test neuf, avec un jeton d'administrateur deja range.
      TestBed.resetTestingModule();
      localStorage.setItem('jeton', fabriquerJeton({ role: 'administrateur' }));
      await TestBed.configureTestingModule({
        imports: [Matchs],
        providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
      }).compileComponents();
      fixture = TestBed.createComponent(Matchs);
      httpMock = TestBed.inject(HttpTestingController);

      repondreAuxDeuxRequetes();
      await fixture.whenStable();

      expect(page().textContent).toContain('Nouveau match');
      // Deux matchs dans les donnees simulees : deux liens « Modifier ».
      expect(page().querySelectorAll('.lien-modifier').length).toBe(2);
    });
  });

  describe('equipes suivies (etape 9)', () => {
    const FNC = { id: 'fnc', nom: 'Fnatic', trigramme: 'FNC' };
    const TH = { id: 'th', nom: 'Team Heretics', trigramme: 'TH' };

    /** Un troisieme match, sans KC ni G2, pour verifier le filtre. */
    const matchSansKc: MatchApi = {
      id: 'm3',
      competitionId: 'lol',
      domicile: FNC,
      exterieur: TH,
      scoreDomicile: null,
      scoreExterieur: null,
      date: '2026-09-16T18:00:00.000Z',
      statut: 'a-venir',
    };

    function page(): HTMLElement {
      return fixture.nativeElement as HTMLElement;
    }

    /** Ouvre la page connecte, en suivant les equipes indiquees. */
    async function ouvrirConnecte(suivies: { id: string; nom: string; trigramme: string }[]) {
      TestBed.resetTestingModule();
      localStorage.setItem('jeton', fabriquerJeton());
      await TestBed.configureTestingModule({
        imports: [Matchs],
        providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
      }).compileComponents();
      fixture = TestBed.createComponent(Matchs);
      component = fixture.componentInstance;
      httpMock = TestBed.inject(HttpTestingController);

      httpMock.expectOne(URL_MATCHS).flush([...matchsApi, matchSansKc]);
      httpMock.expectOne(URL_COMPETITIONS).flush(competitionsApi);
      await fixture.whenStable();
      httpMock.expectOne('http://localhost:3000/api/moi/favoris').flush(suivies);
      await fixture.whenStable();
    }

    it("n'affiche pas de filtre a une personne qui ne suit aucune equipe", async () => {
      await ouvrirConnecte([]);

      expect(page().querySelector('.filtres')).toBeNull();
    });

    it('marque les equipes suivies et filtre sur « Mes équipes »', async () => {
      await ouvrirConnecte([KC]);

      // KC joue deux matchs, a domicile puis a l'exterieur : deux etoiles.
      expect(page().querySelectorAll('.etoile').length).toBe(2);
      expect(component.matchsAVenir().length).toBe(2);

      const boutons = page().querySelectorAll<HTMLButtonElement>('.filtre');
      expect(boutons[1].textContent).toContain('Mes équipes (1)');
      boutons[1].click();
      await fixture.whenStable();

      expect(boutons[1].getAttribute('aria-pressed')).toBe('true');
      // Il ne reste que le match a venir de KC ; Fnatic - Team Heretics a disparu.
      expect(component.matchsAVenir().map((match) => match.id)).toEqual(['m2']);
      expect(component.matchsEnDirect().length).toBe(1);
    });
  });
});
