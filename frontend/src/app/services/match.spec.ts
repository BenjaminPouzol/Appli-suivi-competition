import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MatchService } from './match';
import { DonneesMatch, Match, MatchApi } from '../modeles/match';

describe('MatchService', () => {
  let service: MatchService;
  let httpMock: HttpTestingController;

  /** Une reponse telle que l'API la renvoie : la date y est du TEXTE. */
  const matchsApi: MatchApi[] = [
    {
      id: 'm1',
      competitionId: 'lol',
      domicile: { id: 'kc', nom: 'Karmine Corp', trigramme: 'KC' },
      exterieur: { id: 'g2', nom: 'G2 Esports', trigramme: 'G2' },
      scoreDomicile: 1,
      scoreExterieur: 0,
      date: '2026-09-14T17:00:00.000Z',
      statut: 'en-direct',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(MatchService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('convertit la date texte de l\'API en objet Date', () => {
    let recus: Match[] | undefined;

    service.listerTous().subscribe((matchs) => (recus = matchs));
    httpMock.expectOne('http://localhost:3000/api/matchs').flush(matchsApi);

    expect(recus?.[0].date).toBeInstanceOf(Date);
    expect(recus?.[0].date.toISOString()).toBe('2026-09-14T17:00:00.000Z');
  });

  it('laisse les autres champs inchanges', () => {
    let recus: Match[] | undefined;

    service.listerTous().subscribe((matchs) => (recus = matchs));
    httpMock.expectOne('http://localhost:3000/api/matchs').flush(matchsApi);

    expect(recus?.[0].domicile.trigramme).toBe('KC');
    expect(recus?.[0].scoreDomicile).toBe(1);
    expect(recus?.[0].statut).toBe('en-direct');
  });

  describe('ecritures (etape 7)', () => {
    const donnees: DonneesMatch = {
      competitionId: 'lol',
      domicileId: 'kc',
      exterieurId: 'g2',
      scoreDomicile: null,
      scoreExterieur: null,
      date: new Date('2026-09-15T16:00:00.000Z'),
      statut: 'a-venir',
    };

    it("reconvertit la date en texte UTC avant de l'envoyer", () => {
      service.creer(donnees).subscribe();

      const requete = httpMock.expectOne('http://localhost:3000/api/matchs');
      expect(requete.request.method).toBe('POST');
      // Le corps contient du TEXTE, avec le « Z » que le backend exige.
      expect(requete.request.body.date).toBe('2026-09-15T16:00:00.000Z');
      expect(requete.request.body.domicileId).toBe('kc');
      requete.flush(matchsApi[0], { status: 201, statusText: 'Created' });
    });

    it('convertit aussi le match renvoye par le serveur', () => {
      let recu: Match | undefined;

      service.modifier('m1', donnees).subscribe((match) => (recu = match));

      const requete = httpMock.expectOne('http://localhost:3000/api/matchs/m1');
      expect(requete.request.method).toBe('PUT');
      requete.flush(matchsApi[0]);

      expect(recu?.date).toBeInstanceOf(Date);
    });

    it('supprime un match avec DELETE', () => {
      service.supprimer('m1').subscribe();

      const requete = httpMock.expectOne('http://localhost:3000/api/matchs/m1');
      expect(requete.request.method).toBe('DELETE');
      requete.flush(null, { status: 204, statusText: 'No Content' });
    });
  });
});
