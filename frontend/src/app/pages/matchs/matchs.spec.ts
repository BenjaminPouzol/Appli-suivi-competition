import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Matchs } from './matchs';
import { MatchApi } from '../../modeles/match';
import { Competition } from '../../modeles/competition';

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
    await TestBed.configureTestingModule({
      imports: [Matchs],
      providers: [provideHttpClient(), provideHttpClientTesting()],
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
});
