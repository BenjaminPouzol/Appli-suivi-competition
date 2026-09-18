import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CompetitionService } from './competition';
import { Competition, NouvelleCompetition } from '../modeles/competition';

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
      discipline: 'lol',
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

  /*
   * Etape 7 : pour une ecriture, on verifie trois choses -- la METHODE HTTP,
   * l'ADRESSE, et le CORPS envoye. Ce sont exactement les trois elements du
   * contrat avec le backend.
   */
  it('cree une competition avec POST et envoie ses donnees dans le corps', () => {
    // Etape 10 : tout sauf l'univers, que le serveur deduit de la discipline.
    const nouvelle: NouvelleCompetition = {
      id: 'lol',
      nom: 'League of Legends',
      organisateur: 'Riot Games',
      discipline: 'lol',
      description: 'Test',
    };

    service.creer(nouvelle).subscribe();

    const requete = httpMock.expectOne('http://localhost:3000/api/competitions');
    expect(requete.request.method).toBe('POST');
    expect(requete.request.body).toEqual(nouvelle);
    requete.flush(competitionsSimulees[0], { status: 201, statusText: 'Created' });
  });

  it('modifie une competition avec PUT, sans envoyer son identifiant', () => {
    const donnees = { nom: 'LoL', organisateur: 'Riot', description: 'x' };

    service.modifier('lol', donnees).subscribe();

    const requete = httpMock.expectOne('http://localhost:3000/api/competitions/lol');
    expect(requete.request.method).toBe('PUT');
    expect(requete.request.body).toEqual(donnees);
    requete.flush({ id: 'lol', ...donnees });
  });

  it('supprime une competition avec DELETE', () => {
    let terminee = false;

    service.supprimer('lol').subscribe(() => (terminee = true));

    const requete = httpMock.expectOne('http://localhost:3000/api/competitions/lol');
    expect(requete.request.method).toBe('DELETE');
    // 204 : aucune donnee dans la reponse.
    requete.flush(null, { status: 204, statusText: 'No Content' });

    expect(terminee).toBe(true);
  });
});
