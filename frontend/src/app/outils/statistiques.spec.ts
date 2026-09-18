import {
  formaterDuree,
  formaterEcart,
  formaterMilliers,
  formaterMinute,
  formaterPourcentage,
  parts,
  pourcentage,
} from './statistiques';

/*
 * Des fonctions pures : aucun TestBed, aucune simulation. On donne une
 * entree, on verifie la sortie.
 */
describe('outils de statistiques (etape 10)', () => {
  it('formate une duree en minutes:secondes, avec les heures si besoin', () => {
    expect(formaterDuree(1985)).toBe('33:05');
    expect(formaterDuree(59)).toBe('0:59');
    expect(formaterDuree(3725)).toBe('1:02:05');
  });

  it('formate le gold en milliers, a la francaise', () => {
    expect(formaterMilliers(950)).toBe('950');
    expect(formaterMilliers(16990)).toBe('17,0 k');
    expect(formaterMilliers(52340)).toBe('52,3 k');
  });

  it('calcule un pourcentage arrondi, sans diviser par zero', () => {
    expect(pourcentage(356, 402)).toBe(89);
    expect(pourcentage(0, 0)).toBe(0);
    expect(formaterPourcentage(58)).toBe('58 %');
  });

  it('partage une barre de comparaison entre les deux cotes', () => {
    expect(parts(3, 1)).toEqual([75, 25]);
    expect(parts(0, 0)).toEqual([50, 50]);
  });

  it('ecrit la minute d\'un but, temps additionnel compris', () => {
    expect(formaterMinute(12, null)).toBe('12’');
    expect(formaterMinute(45, 2)).toBe('45+2’');
  });

  it('signe un ecart avec un vrai signe moins', () => {
    expect(formaterEcart(5)).toBe('+5');
    expect(formaterEcart(-3)).toBe('−3');
    expect(formaterEcart(0)).toBe('0');
  });
});
