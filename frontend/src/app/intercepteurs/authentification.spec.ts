import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { REDIRIGER_SI_SESSION_EXPIREE, intercepteurAuthentification } from './authentification';
import { AuthService } from '../services/auth';
import { fabriquerJeton } from '../../testing/jetons-de-test';

describe('intercepteurAuthentification', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  function preparer(jeton: string | null): void {
    localStorage.clear();
    if (jeton !== null) {
      localStorage.setItem('jeton', jeton);
    }

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([intercepteurAuthentification])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  }

  afterEach(() => {
    httpMock.verify();
  });

  it("n'ajoute rien quand personne n'est connecte", () => {
    preparer(null);

    http.get('http://localhost:3000/api/matchs').subscribe();

    const requete = httpMock.expectOne('http://localhost:3000/api/matchs');
    expect(requete.request.headers.has('Authorization')).toBe(false);
    requete.flush([]);
  });

  it('joint le jeton aux requetes vers notre API', () => {
    const jeton = fabriquerJeton();
    preparer(jeton);

    http.post('http://localhost:3000/api/matchs', {}).subscribe();

    const requete = httpMock.expectOne('http://localhost:3000/api/matchs');
    expect(requete.request.headers.get('Authorization')).toBe(`Bearer ${jeton}`);
    requete.flush({});
  });

  it("n'envoie JAMAIS le jeton a un autre serveur", () => {
    preparer(fabriquerJeton());

    http.get('https://api.autre-service.example/donnees').subscribe();

    const requete = httpMock.expectOne('https://api.autre-service.example/donnees');
    expect(requete.request.headers.has('Authorization')).toBe(false);
    requete.flush({});
  });

  it('ferme la session et renvoie vers la connexion si le serveur refuse le jeton (401)', async () => {
    preparer(fabriquerJeton());
    const auth = TestBed.inject(AuthService);
    const router = TestBed.inject(Router);
    const navigation = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    let erreurTransmise = false;

    http.delete('http://localhost:3000/api/matchs/m1').subscribe({
      error: () => (erreurTransmise = true),
    });

    httpMock
      .expectOne('http://localhost:3000/api/matchs/m1')
      .flush({ erreur: 'Session invalide ou expirée' }, { status: 401, statusText: 'Unauthorized' });

    expect(auth.estConnecte()).toBe(false);
    expect(navigation).toHaveBeenCalledWith(['/connexion'], {
      queryParams: { raison: 'session-expiree', retour: '/' },
    });
    // L'erreur n'est pas avalee : le composant peut encore y reagir.
    expect(erreurTransmise).toBe(true);
  });

  it("ferme la session SANS rediriger si la requete l'a demande (etape 9)", () => {
    preparer(fabriquerJeton());
    const auth = TestBed.inject(AuthService);
    const navigation = vi.spyOn(TestBed.inject(Router), 'navigate');

    http
      .get('http://localhost:3000/api/moi/favoris', {
        context: new HttpContext().set(REDIRIGER_SI_SESSION_EXPIREE, false),
      })
      .subscribe({ error: () => {} });

    httpMock
      .expectOne('http://localhost:3000/api/moi/favoris')
      .flush({ erreur: 'Session invalide ou expirée' }, { status: 401, statusText: 'Unauthorized' });

    expect(auth.estConnecte()).toBe(false);
    expect(navigation).not.toHaveBeenCalled();
  });

  it('laisse passer un 403 sans fermer la session', () => {
    preparer(fabriquerJeton());
    const auth = TestBed.inject(AuthService);

    http.post('http://localhost:3000/api/matchs', {}).subscribe({ error: () => {} });

    httpMock
      .expectOne('http://localhost:3000/api/matchs')
      .flush({ erreur: 'Droits insuffisants' }, { status: 403, statusText: 'Forbidden' });

    // 403 : le jeton est valide, c'est le role qui manque. La session reste.
    expect(auth.estConnecte()).toBe(true);
  });
});
