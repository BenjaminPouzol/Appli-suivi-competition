import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { CompetitionFormulaire } from './competition-formulaire';
import { Competition } from '../../modeles/competition';

const API = 'http://localhost:3000/api';

const LOL: Competition = {
  id: 'lol',
  nom: 'League of Legends',
  organisateur: 'Riot Games',
  univers: 'esport',
  discipline: 'lol',
  description: 'Jeu de stratégie en équipe.',
};

describe('CompetitionFormulaire', () => {
  let harnais: RouterTestingHarness;
  let composant: CompetitionFormulaire;
  let httpMock: HttpTestingController;

  async function ouvrir(adresse: string): Promise<void> {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'competitions', children: [] },
          { path: 'competitions/nouvelle', component: CompetitionFormulaire },
          { path: 'competitions/:id/modifier', component: CompetitionFormulaire },
        ]),
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    harnais = await RouterTestingHarness.create();
    composant = await harnais.navigateByUrl(adresse, CompetitionFormulaire);
  }

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

  async function soumettre(): Promise<void> {
    page().querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
    await attendre();
  }

  function remplir(): void {
    composant.formulaire.id().value.set('coupe-de-france');
    composant.formulaire.nom().value.set('Coupe de France');
    composant.formulaire.organisateur().value.set('FFF');
    composant.formulaire.discipline().value.set('football');
    composant.formulaire.description().value.set('Coupe nationale.');
  }

  afterEach(() => {
    httpMock.verify();
  });

  describe('en creation', () => {
    beforeEach(async () => {
      await ouvrir('/competitions/nouvelle');
    });

    it("n'a rien a charger", () => {
      expect(composant.chargement()).toBe(false);
      // afterEach verifie qu'aucune requete n'est partie.
    });

    it('refuse un identifiant mal forme sans rien envoyer', async () => {
      remplir();
      composant.formulaire.id().value.set('Coupe De France');

      await soumettre();

      httpMock.expectNone(`${API}/competitions`);
      expect(page().textContent).toContain('Minuscules, chiffres et tirets uniquement');
    });

    it('envoie un POST puis revient a la liste', async () => {
      remplir();

      await soumettre();

      const requete = httpMock.expectOne(`${API}/competitions`);
      expect(requete.request.method).toBe('POST');
      expect(requete.request.body.id).toBe('coupe-de-france');
      // Etape 10 : la discipline part, l'univers non -- le serveur le deduit.
      expect(requete.request.body.discipline).toBe('football');
      expect(requete.request.body.univers).toBeUndefined();
      requete.flush(
        { ...requete.request.body, univers: 'football' },
        { status: 201, statusText: 'Created' },
      );
      await attendre();

      expect(TestBed.inject(Router).url).toBe('/competitions');
    });

    it("refuse d'envoyer une competition sans discipline (etape 10)", async () => {
      remplir();
      composant.formulaire.discipline().value.set('');

      await soumettre();

      httpMock.expectNone(`${API}/competitions`);
      expect(page().textContent).toContain('Choisis une discipline.');
    });

    it("affiche un identifiant deja pris SOUS le champ identifiant (409)", async () => {
      remplir();

      await soumettre();
      httpMock
        .expectOne(`${API}/competitions`)
        .flush({ erreur: 'Cet identifiant est déjà utilisé' }, { status: 409, statusText: 'Conflict' });
      await attendre();

      const erreursId = page().querySelector('#competition-id-erreurs');
      expect(erreursId?.textContent).toContain('déjà utilisé');
      expect(TestBed.inject(Router).url).toBe('/competitions/nouvelle');

      // L'erreur venue du serveur disparait des que l'identifiant change.
      composant.formulaire.id().value.set('coupe-de-france-2');
      await attendre();
      expect(composant.formulaire.id().invalid()).toBe(false);
    });
  });

  describe('en modification', () => {
    beforeEach(async () => {
      await ouvrir('/competitions/lol/modifier');
      httpMock.expectOne(`${API}/competitions/lol`).flush(LOL);
      await attendre();
    });

    it("pre-remplit le formulaire et fige l'identifiant et la discipline", () => {
      expect(composant.formulaire.nom().value()).toBe('League of Legends');
      expect(composant.formulaire.id().disabled()).toBe(true);
      expect(composant.formulaire.discipline().value()).toBe('lol');
      expect(composant.formulaire.discipline().disabled()).toBe(true);

      const champId = page().querySelector('#competition-id') as HTMLInputElement;
      expect(champId.disabled).toBe(true);
    });

    it("envoie un PUT sans l'identifiant ni la discipline dans le corps", async () => {
      composant.formulaire.nom().value.set('LoL');

      await soumettre();

      const requete = httpMock.expectOne(`${API}/competitions/lol`);
      expect(requete.request.method).toBe('PUT');
      expect(requete.request.body).toEqual({
        nom: 'LoL',
        organisateur: 'Riot Games',
        description: 'Jeu de stratégie en équipe.',
      });
      requete.flush({ ...LOL, nom: 'LoL' });
      await attendre();
    });

    it('explique pourquoi une suppression est refusee (409)', async () => {
      (page().querySelector('.zone-suppression .bouton--danger') as HTMLButtonElement).click();
      await attendre();
      (page().querySelector('.zone-suppression .bouton--danger') as HTMLButtonElement).click();

      httpMock
        .expectOne(`${API}/competitions/lol`)
        .flush(
          { erreur: 'Cette compétition contient encore des matchs. Supprime-les d’abord.' },
          { status: 409, statusText: 'Conflict' },
        );
      await attendre();

      expect(page().textContent).toContain('contient encore des matchs');
      expect(TestBed.inject(Router).url).toBe('/competitions/lol/modifier');
    });
  });
});
