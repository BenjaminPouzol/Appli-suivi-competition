import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { FavorisService } from './favoris';
import { AuthService } from './auth';
import {
  REDIRIGER_SI_SESSION_EXPIREE,
  intercepteurAuthentification,
} from '../intercepteurs/authentification';
import { Equipe } from '../modeles/equipe';
import { fabriquerJeton } from '../../testing/jetons-de-test';

const URL = 'http://localhost:3000/api/moi/favoris';

const KC: Equipe = { id: 'kc', nom: 'Karmine Corp', trigramme: 'KC' };
const FNC: Equipe = { id: 'fnc', nom: 'Fnatic', trigramme: 'FNC' };
const PSG: Equipe = { id: 'psg', nom: 'Paris Saint-Germain', trigramme: 'PSG' };

describe('FavorisService', () => {
  let service: FavorisService;
  let httpMock: HttpTestingController;

  /**
   * Cree le service, avec ou sans personne connectee.
   *
   * TestBed.tick() fait tourner les effect() en attente : c'est a ce moment
   * que le service decouvre la session et lance le chargement.
   */
  function creer(connecte: boolean): void {
    localStorage.clear();
    if (connecte) {
      localStorage.setItem('jeton', fabriquerJeton());
    }

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([intercepteurAuthentification])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });

    service = TestBed.inject(FavorisService);
    httpMock = TestBed.inject(HttpTestingController);
    TestBed.tick();
  }

  afterEach(() => {
    httpMock.verify();
  });

  it("ne charge rien pour une personne anonyme", () => {
    creer(false);

    httpMock.expectNone(URL);
    expect(service.equipesSuivies()).toEqual([]);
  });

  it('charge les favoris a la connexion, sans redirection en cas de session perimee', () => {
    creer(true);

    const requete = httpMock.expectOne(URL);
    // Chargement en arriere-plan : un 401 ne doit pas renvoyer vers la connexion.
    expect(requete.request.context.get(REDIRIGER_SI_SESSION_EXPIREE)).toBe(false);
    requete.flush([FNC, KC]);

    expect(service.idsSuivis().has('kc')).toBe(true);
    expect(service.idsSuivis().has('psg')).toBe(false);
  });

  it('oublie les favoris a la deconnexion', () => {
    creer(true);
    httpMock.expectOne(URL).flush([KC]);

    TestBed.inject(AuthService).deconnecter();
    TestBed.tick();

    expect(service.equipesSuivies()).toEqual([]);
  });

  describe('suivre et ne plus suivre', () => {
    beforeEach(() => {
      creer(true);
      httpMock.expectOne(URL).flush([KC]);
    });

    it("met l'affichage a jour AVANT la reponse du serveur (optimiste)", () => {
      service.basculer(PSG);

      // La requete n'a pas encore de reponse... et l'equipe est deja suivie.
      const requete = httpMock.expectOne(`${URL}/psg`);
      expect(requete.request.method).toBe('PUT');
      expect(service.idsSuivis().has('psg')).toBe(true);
      expect(service.enCours().has('psg')).toBe(true);

      requete.flush(null, { status: 204, statusText: 'No Content' });
      expect(service.enCours().has('psg')).toBe(false);
    });

    it('garde les favoris tries par nom', () => {
      service.basculer(FNC);
      httpMock.expectOne(`${URL}/fnc`).flush(null, { status: 204, statusText: 'No Content' });

      expect(service.equipesSuivies().map((equipe) => equipe.id)).toEqual(['fnc', 'kc']);
    });

    it('revient en arriere et explique si le serveur refuse', () => {
      service.basculer(KC);

      const requete = httpMock.expectOne(`${URL}/kc`);
      expect(requete.request.method).toBe('DELETE');
      expect(service.idsSuivis().has('kc')).toBe(false);

      requete.flush({ erreur: 'Erreur interne du serveur' }, { status: 500, statusText: 'Erreur' });

      expect(service.idsSuivis().has('kc')).toBe(true);
      expect(service.erreur()).not.toBeNull();
    });

    it('ignore un second clic tant que la premiere requete est en cours', () => {
      service.basculer(PSG);
      service.basculer(PSG);

      // Une seule requete : le second clic aurait envoye un DELETE.
      httpMock.expectOne(`${URL}/psg`).flush(null, { status: 204, statusText: 'No Content' });
      expect(service.idsSuivis().has('psg')).toBe(true);
    });
  });
});
