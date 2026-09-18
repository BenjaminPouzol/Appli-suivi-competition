import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { MatchFormulaire } from './match-formulaire';
import { Competition } from '../../modeles/competition';
import { Equipe } from '../../modeles/equipe';
import { MatchApi } from '../../modeles/match';

const API = 'http://localhost:3000/api';

const COMPETITIONS: Competition[] = [
  {
    id: 'lol',
    nom: 'League of Legends',
    organisateur: 'Riot',
    univers: 'esport',
    discipline: 'lol',
    description: '',
  },
];

const EQUIPES: Equipe[] = [
  { id: 'g2', nom: 'G2 Esports', trigramme: 'G2' },
  { id: 'kc', nom: 'Karmine Corp', trigramme: 'KC' },
];

const MATCH: MatchApi = {
  id: 'm1',
  competitionId: 'lol',
  domicile: EQUIPES[1],
  exterieur: EQUIPES[0],
  scoreDomicile: 1,
  scoreExterieur: 0,
  date: '2026-09-14T15:00:00.000Z',
  statut: 'en-direct',
  scoreCalcule: false,
};

/*
 * RouterTestingHarness navigue VRAIMENT vers une adresse, comme le ferait
 * l'application. C'est ce qui permet de tester les deux modes du composant
 * (/matchs/nouveau et /matchs/m1/modifier), et de verifier qu'il redirige
 * bien vers /matchs apres l'enregistrement.
 */
describe('MatchFormulaire', () => {
  let harnais: RouterTestingHarness;
  let composant: MatchFormulaire;
  let httpMock: HttpTestingController;

  async function ouvrir(adresse: string): Promise<void> {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'matchs', children: [] },
          { path: 'matchs/nouveau', component: MatchFormulaire },
          { path: 'matchs/:id/modifier', component: MatchFormulaire },
        ]),
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    harnais = await RouterTestingHarness.create();
    composant = await harnais.navigateByUrl(adresse, MatchFormulaire);
  }

  /** Le HTML actuellement affiche. */
  function page(): HTMLElement {
    return harnais.routeNativeElement as HTMLElement;
  }

  /**
   * Laisse l'application terminer ce qu'elle a commence.
   *
   * Apres flush(), la reponse du serveur resout la promesse de firstValueFrom
   * -- mais la suite (navigation, message d'erreur) ne s'execute qu'au tour
   * suivant. setTimeout laisse passer ce tour ; whenStable() attend ensuite
   * qu'Angular ait fini de mettre a jour la page et la navigation.
   */
  async function attendre(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve));
    await harnais.fixture.whenStable();
  }

  /** Simule un clic sur « Enregistrer ». */
  async function soumettre(): Promise<void> {
    page().querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
    await attendre();
  }

  afterEach(() => {
    httpMock.verify();
  });

  describe('en creation', () => {
    beforeEach(async () => {
      await ouvrir('/matchs/nouveau');
      httpMock.expectOne(`${API}/competitions`).flush(COMPETITIONS);
      httpMock.expectOne(`${API}/equipes`).flush(EQUIPES);
      await attendre();
    });

    it('charge les listes de choix, et aucun match', () => {
      expect(composant.enModification).toBe(false);
      expect(composant.chargement()).toBe(false);
      // afterEach verifie qu'aucune requete vers /api/matchs/... n'est partie.
    });

    it("n'envoie rien si le formulaire est vide, et affiche les erreurs", async () => {
      await soumettre();

      httpMock.expectNone(`${API}/matchs`);
      expect(page().textContent).toContain('Choisis une compétition.');
      expect(page().textContent).toContain('Indique la date');
    });

    it('refuse une equipe opposee a elle-meme', async () => {
      composant.formulaire.domicileId().value.set('kc');
      composant.formulaire.exterieurId().value.set('kc');

      await soumettre();

      httpMock.expectNone(`${API}/matchs`);
      expect(page().textContent).toContain('Une équipe ne peut pas se rencontrer elle-même.');
    });

    it('envoie un POST avec la date en UTC, puis revient a la liste', async () => {
      composant.formulaire.competitionId().value.set('lol');
      composant.formulaire.domicileId().value.set('kc');
      composant.formulaire.exterieurId().value.set('g2');
      composant.formulaire.date().value.set('2026-09-20T21:00');

      await soumettre();

      const requete = httpMock.expectOne(`${API}/matchs`);
      expect(requete.request.method).toBe('POST');
      expect(requete.request.body.date).toBe(new Date('2026-09-20T21:00').toISOString());
      expect(requete.request.body.scoreDomicile).toBeNull();

      requete.flush(MATCH, { status: 201, statusText: 'Created' });
      await attendre();

      expect(TestBed.inject(Router).url).toBe('/matchs');
    });

    it("affiche le message du serveur si l'enregistrement echoue", async () => {
      composant.formulaire.competitionId().value.set('lol');
      composant.formulaire.domicileId().value.set('kc');
      composant.formulaire.exterieurId().value.set('g2');
      composant.formulaire.date().value.set('2026-09-20T21:00');

      await soumettre();
      httpMock
        .expectOne(`${API}/matchs`)
        .flush(
          { erreur: "La compétition ou l'une des équipes indiquées n'existe pas" },
          { status: 400, statusText: 'Bad Request' },
        );
      await attendre();

      expect(page().textContent).toContain("n'existe pas");
      expect(TestBed.inject(Router).url).toBe('/matchs/nouveau');
    });
  });

  describe('en modification', () => {
    beforeEach(async () => {
      await ouvrir('/matchs/m1/modifier');
      httpMock.expectOne(`${API}/competitions`).flush(COMPETITIONS);
      httpMock.expectOne(`${API}/equipes`).flush(EQUIPES);
      httpMock.expectOne(`${API}/matchs/m1`).flush(MATCH);
      await attendre();
    });

    it('pre-remplit le formulaire avec le match charge', () => {
      expect(composant.enModification).toBe(true);
      expect(composant.formulaire.domicileId().value()).toBe('kc');
      expect(composant.formulaire.scoreDomicile().value()).toBe(1);
      expect(composant.scoresVisibles()).toBe(true);
    });

    it('envoie un PUT sur l\'adresse du match', async () => {
      composant.formulaire.scoreExterieur().value.set(1);

      await soumettre();

      const requete = httpMock.expectOne(`${API}/matchs/m1`);
      expect(requete.request.method).toBe('PUT');
      expect(requete.request.body.scoreExterieur).toBe(1);
      requete.flush(MATCH);
      await attendre();
    });

    it("n'envoie plus de score quand le match repasse « a venir »", async () => {
      composant.formulaire.statut().value.set('a-venir');
      await attendre();

      expect(composant.scoresVisibles()).toBe(false);

      await soumettre();

      const requete = httpMock.expectOne(`${API}/matchs/m1`);
      expect(requete.request.body.scoreDomicile).toBeNull();
      expect(requete.request.body.scoreExterieur).toBeNull();
      requete.flush(MATCH);
      await attendre();
    });

    it('demande une confirmation avant de supprimer', async () => {
      const bouton = page().querySelector('.zone-suppression .bouton--danger') as HTMLButtonElement;
      bouton.click();
      await attendre();

      // Premier clic : rien n'est parti, on demande seulement confirmation.
      httpMock.expectNone(`${API}/matchs/m1`);
      expect(page().textContent).toContain('Supprimer définitivement ce match ?');

      const confirmer = page().querySelector('.zone-suppression .bouton--danger') as HTMLButtonElement;
      confirmer.click();

      const requete = httpMock.expectOne(`${API}/matchs/m1`);
      expect(requete.request.method).toBe('DELETE');
      requete.flush(null, { status: 204, statusText: 'No Content' });
      await attendre();

      expect(TestBed.inject(Router).url).toBe('/matchs');
    });
  });

  describe('match avec statistiques detaillees (etape 10)', () => {
    const MATCH_DETAILLE: MatchApi = { ...MATCH, scoreCalcule: true };

    beforeEach(async () => {
      await ouvrir('/matchs/m1/modifier');
      httpMock.expectOne(`${API}/competitions`).flush(COMPETITIONS);
      httpMock.expectOne(`${API}/equipes`).flush(EQUIPES);
      httpMock.expectOne(`${API}/matchs/m1`).flush(MATCH_DETAILLE);
      await attendre();
    });

    it('fige la competition, les equipes et le score, et explique pourquoi', () => {
      expect(composant.detailsVerrouilles()).toBe(true);
      expect(composant.formulaire.competitionId().disabled()).toBe(true);
      expect(composant.formulaire.domicileId().disabled()).toBe(true);
      expect(composant.formulaire.scoreDomicile().disabled()).toBe(true);
      // La date et le statut restent modifiables.
      expect(composant.formulaire.date().disabled()).toBe(false);
      expect(composant.formulaire.statut().disabled()).toBe(false);

      expect((page().querySelector('#match-domicile') as HTMLSelectElement).disabled).toBe(true);
      expect(page().textContent).toContain('Ce match a des statistiques détaillées');
    });

    it('envoie quand meme les valeurs figees, inchangees', async () => {
      composant.formulaire.statut().value.set('termine');

      await soumettre();

      const requete = httpMock.expectOne(`${API}/matchs/m1`);
      expect(requete.request.method).toBe('PUT');
      expect(requete.request.body.statut).toBe('termine');
      // Le serveur verifie qu'elles n'ont pas change : il faut donc les envoyer.
      expect(requete.request.body.domicileId).toBe('kc');
      expect(requete.request.body.scoreDomicile).toBe(1);
      requete.flush({ ...MATCH_DETAILLE, statut: 'termine' });
      await attendre();
    });
  });

  it("signale un match qui n'existe pas", async () => {
    await ouvrir('/matchs/inconnu/modifier');
    httpMock.expectOne(`${API}/competitions`).flush(COMPETITIONS);
    httpMock.expectOne(`${API}/equipes`).flush(EQUIPES);
    httpMock
      .expectOne(`${API}/matchs/inconnu`)
      .flush({ erreur: 'Match introuvable' }, { status: 404, statusText: 'Not Found' });
    await attendre();

    expect(page().textContent).toContain("Ce match n'existe pas");
    expect(page().querySelector('form')).toBeNull();
  });
});
