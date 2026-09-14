import { TestBed } from '@angular/core/testing';
import { CompetitionService } from './competition';

describe('CompetitionService', () => {
  let service: CompetitionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompetitionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('liste les quatre competitions du projet', () => {
    expect(service.listerToutes().length).toBe(4);
  });

  it('separe les competitions par univers', () => {
    const esport = service.listerParUnivers('esport');
    const football = service.listerParUnivers('football');

    expect(esport.length).toBe(2);
    expect(football.length).toBe(2);
    expect(esport.every((competition) => competition.univers === 'esport')).toBe(true);
  });

  it('retrouve une competition par son identifiant', () => {
    expect(service.trouverParId('lol')?.nom).toBe('League of Legends');
  });

  it('renvoie undefined pour un identifiant inconnu', () => {
    expect(service.trouverParId('echecs')).toBeUndefined();
  });
});
