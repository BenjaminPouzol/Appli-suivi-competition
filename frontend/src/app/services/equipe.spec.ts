import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EquipeService } from './equipe';
import { Equipe } from '../modeles/equipe';

describe('EquipeService', () => {
  let service: EquipeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(EquipeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('appelle GET /api/equipes', () => {
    const equipes: Equipe[] = [{ id: 'kc', nom: 'Karmine Corp', trigramme: 'KC' }];
    let recues: Equipe[] | undefined;

    service.listerToutes().subscribe((resultat) => (recues = resultat));

    const requete = httpMock.expectOne('http://localhost:3000/api/equipes');
    expect(requete.request.method).toBe('GET');
    requete.flush(equipes);

    expect(recues).toEqual(equipes);
  });
});
