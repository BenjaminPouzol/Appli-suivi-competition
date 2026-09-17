import { depuisChampDateHeure, versChampDateHeure } from './dates';

describe('Conversion des dates pour les champs datetime-local', () => {
  it('formate une date en heure LOCALE, avec des zeros devant', () => {
    // new Date(annee, mois, jour, heure, minute) construit une date en heure
    // locale : le test donne le meme resultat quel que soit le fuseau de la
    // machine qui l'execute. Rappel : les mois commencent a 0 (8 = septembre).
    const date = new Date(2026, 8, 5, 9, 7);

    expect(versChampDateHeure(date)).toBe('2026-09-05T09:07');
  });

  it('relit le texte du champ en heure locale', () => {
    const date = depuisChampDateHeure('2026-09-15T18:00');

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(8);
    expect(date.getDate()).toBe(15);
    expect(date.getHours()).toBe(18);
    expect(date.getMinutes()).toBe(0);
  });

  it("fait l'aller-retour sans decaler l'heure", () => {
    // Le bug que ces fonctions evitent : ecrire la date en UTC dans le champ,
    // puis la relire en heure locale -- et perdre (ou gagner) deux heures.
    const origine = new Date('2026-09-15T16:00:00.000Z');

    const relue = depuisChampDateHeure(versChampDateHeure(origine));

    expect(relue.getTime()).toBe(origine.getTime());
  });
});
