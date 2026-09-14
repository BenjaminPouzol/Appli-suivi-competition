import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CompetitionService } from './competition';
import { Competition } from '../modeles/competition';

/*
 * Un test ne doit JAMAIS appeler la vraie API : il echouerait des que le
 * serveur est eteint, et serait lent. HttpTestingController intercepte les
 * requetes et permet de decider soi-meme ce que « le serveur » repond.
 */
describe('CompetitionService', () => {
  let service: CompetitionService;
  let httpMock: HttpTestingController;

  const competitionsSimulees: Competition[] = [
    {
      id: 'lol',
      nom: 'League of Legends',
      organisateur: 'Riot Games',
      univers: 'esport',
      description: 'Test',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(CompetitionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Echoue si une requete a ete envoyee sans etre traitee par le test.
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('appelle la bonne adresse et renvoie les competitions', () => {
    let recues: Competition[] | undefined;

    service.listerToutes().subscribe((competitions) => (recues = competitions));

    const requete = httpMock.expectOne('http://localhost:3000/api/competitions');
    expect(requete.request.method).toBe('GET');

    requete.flush(competitionsSimulees);

    expect(recues).toEqual(competitionsSimulees);
  });

  it('transmet les erreurs du serveur a l\'appelant', () => {
    let erreurRecue = false;

    service.listerToutes().subscribe({
      next: () => {},
      error: () => (erreurRecue = true),
    });

    httpMock
      .expectOne('http://localhost:3000/api/competitions')
      .flush('Erreur', { status: 500, statusText: 'Erreur interne' });

    expect(erreurRecue).toBe(true);
  });
});
