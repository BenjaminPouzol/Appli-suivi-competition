import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { administrateurRequis } from './authentification';
import { fabriquerJeton } from '../../testing/jetons-de-test';
import { Role } from '../modeles/utilisateur';

@Component({ template: 'page reservee' })
class PageReservee {}

@Component({ template: 'page quelconque' })
class PageQuelconque {}

describe('administrateurRequis', () => {
  /** Tente d'ouvrir la page reservee, et renvoie l'adresse ou l'on arrive. */
  async function tenterDOuvrir(role: Role | null): Promise<string> {
    localStorage.clear();
    if (role !== null) {
      localStorage.setItem('jeton', fabriquerJeton({ role }));
    }

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideRouter([
          { path: 'matchs/nouveau', component: PageReservee, canActivate: [administrateurRequis] },
          { path: 'connexion', component: PageQuelconque },
          { path: 'acces-refuse', component: PageQuelconque },
        ]),
      ],
    });

    const harnais = await RouterTestingHarness.create();
    await harnais.navigateByUrl('/matchs/nouveau');
    return TestBed.inject(Router).url;
  }

  it('renvoie une personne anonyme vers la connexion, en retenant la page demandee', async () => {
    expect(await tenterDOuvrir(null)).toBe('/connexion?retour=%2Fmatchs%2Fnouveau');
  });

  it('renvoie un simple utilisateur vers la page « acces reserve »', async () => {
    expect(await tenterDOuvrir('utilisateur')).toBe('/acces-refuse');
  });

  it('laisse passer un administrateur', async () => {
    expect(await tenterDOuvrir('administrateur')).toBe('/matchs/nouveau');
  });
});
