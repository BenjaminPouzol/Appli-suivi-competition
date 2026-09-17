import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Equipes } from './equipes';
import { Equipe } from '../../modeles/equipe';
import { fabriquerJeton } from '../../../testing/jetons-de-test';

const API = 'http://localhost:3000/api';

const EQUIPES: Equipe[] = [
  { id: 'fnc', nom: 'Fnatic', trigramme: 'FNC' },
  { id: 'kc', nom: 'Karmine Corp', trigramme: 'KC' },
];

describe('Equipes', () => {
  let fixture: ComponentFixture<Equipes>;
  let httpMock: HttpTestingController;

  async function ouvrir(connecte: boolean): Promise<void> {
    localStorage.clear();
    if (connecte) {
      localStorage.setItem('jeton', fabriquerJeton());
    }

    await TestBed.configureTestingModule({
      imports: [Equipes],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Equipes);
    httpMock = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  }

  function page(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  afterEach(() => {
    httpMock.verify();
  });

  it('liste les equipes sans bouton pour une personne anonyme', async () => {
    await ouvrir(false);

    httpMock.expectOne(`${API}/equipes`).flush(EQUIPES);
    await fixture.whenStable();

    expect(page().querySelectorAll('.carte').length).toBe(2);
    expect(page().querySelectorAll('.bouton-favori').length).toBe(0);
    expect(page().textContent).toContain('pour suivre tes équipes favorites');
  });

  it("indique quelles equipes sont suivies, et permet d'en suivre une autre", async () => {
    await ouvrir(true);

    httpMock.expectOne(`${API}/equipes`).flush(EQUIPES);
    httpMock.expectOne(`${API}/moi/favoris`).flush([EQUIPES[1]]);
    await fixture.whenStable();

    const boutons = page().querySelectorAll<HTMLButtonElement>('.bouton-favori');
    expect(boutons[0].getAttribute('aria-pressed')).toBe('false'); // Fnatic
    expect(boutons[1].getAttribute('aria-pressed')).toBe('true'); // Karmine Corp
    expect(page().textContent).toContain('Tu suis 1 équipe');

    boutons[0].click();
    await fixture.whenStable();

    const requete = httpMock.expectOne(`${API}/moi/favoris/fnc`);
    expect(requete.request.method).toBe('PUT');
    // L'affichage n'a pas attendu la reponse.
    expect(boutons[0].getAttribute('aria-pressed')).toBe('true');
    expect(page().textContent).toContain('Tu suis 2 équipes');
    requete.flush(null, { status: 204, statusText: 'No Content' });
  });
});
