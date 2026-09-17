import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Connexion } from './connexion';
import { AuthService } from '../../services/auth';
import { fabriquerJeton } from '../../../testing/jetons-de-test';

@Component({ template: '' })
class PageVide {}

const URL_CONNEXION = 'http://localhost:3000/api/auth/connexion';

describe('Connexion', () => {
  let harnais: RouterTestingHarness;
  let composant: Connexion;
  let httpMock: HttpTestingController;

  async function ouvrir(adresse: string): Promise<void> {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'connexion', component: Connexion },
          { path: '**', component: PageVide },
        ]),
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    harnais = await RouterTestingHarness.create();
    composant = await harnais.navigateByUrl(adresse, Connexion);
  }

  function page(): HTMLElement {
    return harnais.routeNativeElement as HTMLElement;
  }

  /** Voir match-formulaire.spec.ts : laisse la suite du code s'executer. */
  async function attendre(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve));
    await harnais.fixture.whenStable();
  }

  async function soumettre(email: string, motDePasse: string): Promise<void> {
    composant.formulaire.email().value.set(email);
    composant.formulaire.motDePasse().value.set(motDePasse);
    page().querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
    await attendre();
  }

  afterEach(() => {
    httpMock.verify();
  });

  it('connecte la personne puis la ramene a la page demandee', async () => {
    await ouvrir('/connexion?retour=%2Fmatchs%2Fnouveau');

    await soumettre('benjamin@exemple.fr', 'une phrase de passe');
    const requete = httpMock.expectOne(URL_CONNEXION);
    expect(requete.request.body).toEqual({
      email: 'benjamin@exemple.fr',
      motDePasse: 'une phrase de passe',
    });
    requete.flush({ jeton: fabriquerJeton(), utilisateur: {} });
    await attendre();

    expect(TestBed.inject(AuthService).estConnecte()).toBe(true);
    expect(TestBed.inject(Router).url).toBe('/matchs/nouveau');
  });

  it('refuse de rediriger vers un autre site', async () => {
    await ouvrir('/connexion?retour=https:%2F%2Fsite-pirate.example');

    await soumettre('benjamin@exemple.fr', 'une phrase de passe');
    httpMock.expectOne(URL_CONNEXION).flush({ jeton: fabriquerJeton(), utilisateur: {} });
    await attendre();

    expect(TestBed.inject(Router).url).toBe('/');
  });

  it('affiche un message sans quitter la page si les identifiants sont faux', async () => {
    await ouvrir('/connexion');

    await soumettre('benjamin@exemple.fr', 'mauvais');
    httpMock
      .expectOne(URL_CONNEXION)
      .flush({ erreur: 'Email ou mot de passe incorrect' }, { status: 401, statusText: 'Unauthorized' });
    await attendre();

    expect(page().textContent).toContain('Email ou mot de passe incorrect.');
    expect(TestBed.inject(Router).url).toBe('/connexion');
  });

  it("n'envoie rien si un champ est vide", async () => {
    await ouvrir('/connexion');

    await soumettre('', '');

    httpMock.expectNone(URL_CONNEXION);
    expect(page().textContent).toContain('Indique ton adresse email.');
  });

  it('explique une session expiree', async () => {
    await ouvrir('/connexion?raison=session-expiree');

    expect(page().textContent).toContain('Ta session a expiré.');
  });
});
