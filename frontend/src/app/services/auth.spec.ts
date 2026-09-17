import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth';
import { fabriquerJeton } from '../../testing/jetons-de-test';
import { ReponseAuthentification } from '../modeles/utilisateur';

describe('AuthService', () => {
  let httpMock: HttpTestingController;

  /** Cree le service APRES avoir prepare le stockage : il le lit a sa creation. */
  function creerService(): AuthService {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
    return TestBed.inject(AuthService);
  }

  function reponse(jeton: string): ReponseAuthentification {
    return {
      jeton,
      utilisateur: {
        id: 'id-de-test',
        email: 'benjamin@exemple.fr',
        pseudo: 'Benjamin',
        role: 'utilisateur',
        creeLe: '2026-09-17T10:00:00.000Z',
      },
    };
  }

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("n'a personne de connecte au depart", () => {
    const service = creerService();

    expect(service.estConnecte()).toBe(false);
    expect(service.utilisateur()).toBeNull();
  });

  it('ouvre la session et retient le jeton apres une connexion', () => {
    const service = creerService();
    const jeton = fabriquerJeton({ pseudo: 'Benjamin' });

    service.connecter({ email: 'benjamin@exemple.fr', motDePasse: 'secret' }).subscribe();

    const requete = httpMock.expectOne('http://localhost:3000/api/auth/connexion');
    expect(requete.request.method).toBe('POST');
    requete.flush(reponse(jeton));

    expect(service.estConnecte()).toBe(true);
    expect(service.utilisateur()?.pseudo).toBe('Benjamin');
    expect(localStorage.getItem('jeton')).toBe(jeton);
  });

  it('retrouve la session apres un rechargement de page', () => {
    localStorage.setItem('jeton', fabriquerJeton({ role: 'administrateur' }));

    const service = creerService();

    expect(service.estConnecte()).toBe(true);
    expect(service.estAdministrateur()).toBe(true);
  });

  it('efface un jeton expire retrouve dans le stockage', () => {
    localStorage.setItem('jeton', fabriquerJeton({ expireDans: -60 }));

    const service = creerService();

    expect(service.estConnecte()).toBe(false);
    expect(localStorage.getItem('jeton')).toBeNull();
  });

  it('oublie tout a la deconnexion, sans appeler le serveur', () => {
    localStorage.setItem('jeton', fabriquerJeton());
    const service = creerService();

    service.deconnecter();

    expect(service.estConnecte()).toBe(false);
    expect(localStorage.getItem('jeton')).toBeNull();
    // afterEach : httpMock.verify() confirme qu'aucune requete n'est partie.
  });
});
