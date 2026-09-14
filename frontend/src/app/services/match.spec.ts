import { TestBed } from '@angular/core/testing';
import { MatchService } from './match';

describe('MatchService', () => {
  let service: MatchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MatchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('ne renvoie que les matchs du statut demande', () => {
    const enDirect = service.listerParStatut('en-direct');

    expect(enDirect.length).toBeGreaterThan(0);
    expect(enDirect.every((match) => match.statut === 'en-direct')).toBe(true);
  });

  it('range les matchs par ordre chronologique', () => {
    const aVenir = service.listerParStatut('a-venir');

    for (let i = 1; i < aVenir.length; i++) {
      expect(aVenir[i].date.getTime()).toBeGreaterThanOrEqual(aVenir[i - 1].date.getTime());
    }
  });

  it("laisse le score a null tant qu'un match n'a pas commence", () => {
    const aVenir = service.listerParStatut('a-venir');

    expect(aVenir.every((match) => match.scoreDomicile === null)).toBe(true);
  });
});
