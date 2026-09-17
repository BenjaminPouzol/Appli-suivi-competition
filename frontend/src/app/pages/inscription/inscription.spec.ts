import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Inscription } from './inscription';
import { fabriquerJeton } from '../../../testing/jetons-de-test';

@Component({ template: '' })
class PageVide {}

const URL_INSCRIPTION = 'http://localhost:3000/api/auth/inscription';

describe('Inscription', () => {
  let harnais: RouterTestingHarness;
  let composant: Inscription;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'inscription', component: Inscription },
          { path: '**', component: PageVide },
        ]),
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    harnais = await RouterTestingHarness.create();
    composant = await harnais.navigateByUrl('/inscription', Inscription);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function page(): HTMLElement {
    return harnais.routeNativeElement as HTMLElement;
  }

  async function attendre(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve));
    await harnais.fixture.whenStable();
  }

  /** Remplit le formulaire avec des valeurs correctes, sauf celles precisees. */
  async function soumettre({
    email = 'benjamin@exemple.fr',
    confirmation = 'trois chats sur un toit',
  } = {}): Promise<void> {
    composant.formulaire.pseudo().value.set('Benjamin');
    composant.formulaire.email().value.set(email);
    composant.formulaire.motDePasse().value.set('trois chats sur un toit');
    composant.formulaire.confirmation().value.set(confirmation);
    page().querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
    await attendre();
  }

  it("n'envoie rien si la confirmation ne correspond pas", async () => {
    await soumettre({ confirmation: 'trois chats sur un toi' });

    httpMock.expectNone(URL_INSCRIPTION);
    expect(page().textContent).toContain('Les deux mots de passe ne correspondent pas.');
  });

  it('refuse une adresse sans point, comme le backend', async () => {
    await soumettre({ email: 'benjamin@exemple' });

    httpMock.expectNone(URL_INSCRIPTION);
    expect(page().querySelector('#inscription-email-erreurs')?.textContent).toContain(
      'Adresse email invalide.',
    );
  });

  it("n'envoie PAS la confirmation au serveur", async () => {
    await soumettre();

    const requete = httpMock.expectOne(URL_INSCRIPTION);
    expect(requete.request.body).toEqual({
      pseudo: 'Benjamin',
      email: 'benjamin@exemple.fr',
      motDePasse: 'trois chats sur un toit',
    });
    requete.flush({ jeton: fabriquerJeton(), utilisateur: {} }, { status: 201, statusText: 'Created' });
    await attendre();

    expect(TestBed.inject(Router).url).toBe('/');
  });

  it('affiche une adresse deja utilisee sous le champ email (409)', async () => {
    await soumettre();

    httpMock
      .expectOne(URL_INSCRIPTION)
      .flush({ erreur: 'Un compte existe déjà' }, { status: 409, statusText: 'Conflict' });
    await attendre();

    expect(page().querySelector('#inscription-email-erreurs')?.textContent).toContain(
      'Un compte existe déjà avec cette adresse',
    );
  });
});
