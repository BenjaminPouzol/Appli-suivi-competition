import { lireContenuJeton } from './jetons';
import { fabriquerJeton } from '../../testing/jetons-de-test';

describe('lireContenuJeton', () => {
  it('lit le pseudo, le role et l\'expiration', () => {
    const utilisateur = lireContenuJeton(fabriquerJeton({ pseudo: 'Benjamin', role: 'administrateur' }));

    expect(utilisateur?.pseudo).toBe('Benjamin');
    expect(utilisateur?.role).toBe('administrateur');
    expect(utilisateur?.expiration).toBeInstanceOf(Date);
  });

  it('decode correctement un pseudo accentue (UTF-8)', () => {
    expect(lireContenuJeton(fabriquerJeton({ pseudo: 'Élodie' }))?.pseudo).toBe('Élodie');
  });

  it('ignore un jeton expire', () => {
    expect(lireContenuJeton(fabriquerJeton({ expireDans: -60 }))).toBeNull();
  });

  it("compare l'expiration a l'heure qu'on lui donne", () => {
    const jeton = fabriquerJeton({ expireDans: 3600 });
    const dansDeuxHeures = new Date(Date.now() + 2 * 3600 * 1000);

    expect(lireContenuJeton(jeton, dansDeuxHeures)).toBeNull();
  });

  it('ignore un jeton illisible ou incomplet', () => {
    expect(lireContenuJeton('pas-un-jeton')).toBeNull();
    expect(lireContenuJeton('a.b.c')).toBeNull();
    expect(lireContenuJeton('')).toBeNull();
  });
});
