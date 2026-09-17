import { adresseDeRetour } from './adresse-retour';

describe('adresseDeRetour', () => {
  it('accepte un chemin interne a l\'application', () => {
    expect(adresseDeRetour('/matchs')).toBe('/matchs');
    expect(adresseDeRetour('/matchs/m2/modifier')).toBe('/matchs/m2/modifier');
  });

  it("revient a l'accueil sans adresse", () => {
    expect(adresseDeRetour(null)).toBe('/');
    expect(adresseDeRetour(undefined)).toBe('/');
    expect(adresseDeRetour('')).toBe('/');
  });

  /*
   * Chacune de ces adresses menerait vers un AUTRE site : c'est ce que la
   * fonction doit empecher (redirection ouverte).
   */
  it('refuse toute adresse qui sortirait du site', () => {
    expect(adresseDeRetour('https://site-pirate.example')).toBe('/');
    expect(adresseDeRetour('//site-pirate.example')).toBe('/');
    expect(adresseDeRetour('/\\site-pirate.example')).toBe('/');
    expect(adresseDeRetour('javascript:alert(1)')).toBe('/');
  });
});
