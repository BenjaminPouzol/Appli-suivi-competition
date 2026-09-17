import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Competitions } from './competitions';
import { Competition } from '../../modeles/competition';

describe('Competitions', () => {
  let component: Competitions;
  let fixture: ComponentFixture<Competitions>;
  let httpMock: HttpTestingController;

  const competitionsSimulees: Competition[] = [
    { id: 'lol', nom: 'League of Legends', organisateur: 'Riot', univers: 'esport', description: '' },
    { id: 'valorant', nom: 'Valorant', organisateur: 'Riot', univers: 'esport', description: '' },
    { id: 'ligue1', nom: 'Ligue 1', organisateur: 'LFP', univers: 'football', description: '' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Competitions],
      // Etape 7 : la page contient des liens routerLink, qui ont besoin du routeur.
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Competitions);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    httpMock.expectOne('http://localhost:3000/api/competitions').flush([]);
  });

  it('affiche un message pendant le chargement', async () => {
    await fixture.whenStable();

    // La requete n'a pas encore ete satisfaite : on est dans l'etat d'attente.
    expect(component.chargement()).toBe(true);
    const texte = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texte).toContain('Chargement');

    httpMock.expectOne('http://localhost:3000/api/competitions').flush([]);
  });

  it('repartit les competitions par univers une fois recues', async () => {
    httpMock.expectOne('http://localhost:3000/api/competitions').flush(competitionsSimulees);
    await fixture.whenStable();

    expect(component.chargement()).toBe(false);
    expect(component.competitionsEsport().length).toBe(2);
    expect(component.competitionsFootball().length).toBe(1);

    const cartes = (fixture.nativeElement as HTMLElement).querySelectorAll('.carte');
    expect(cartes.length).toBe(3);
  });

  it('affiche un message si l\'API ne repond pas', async () => {
    httpMock
      .expectOne('http://localhost:3000/api/competitions')
      .flush('Indisponible', { status: 500, statusText: 'Erreur interne' });
    await fixture.whenStable();

    expect(component.chargement()).toBe(false);
    expect(component.erreur()).not.toBeNull();

    const texte = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texte).toContain('Impossible de charger');
  });
});
