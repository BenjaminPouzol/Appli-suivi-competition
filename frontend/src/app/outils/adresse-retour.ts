/**
 * Etape 8 : valide l'adresse de retour apres une connexion.
 *
 * La page de connexion recoit dans son adresse la page ou revenir :
 *     /connexion?retour=/matchs/nouveau
 *
 * Tout ce qui est dans une adresse peut etre fabrique par n'importe qui. Un
 * attaquant pourrait envoyer a sa victime un lien vers la VRAIE page de
 * connexion du site, mais avec :
 *     /connexion?retour=https://site-pirate.example/faux-formulaire
 *
 * La victime verifie l'adresse, voit le bon site, se connecte -- et se
 * retrouve sur une copie du site qui lui redemande son mot de passe. C'est
 * une REDIRECTION OUVERTE (« open redirect »).
 *
 * La parade : n'accepter qu'un chemin INTERNE a l'application.
 */
export function adresseDeRetour(retour: string | null | undefined): string {
  if (
    typeof retour !== 'string' ||
    // Doit commencer par une seule barre oblique : « /matchs ».
    !retour.startsWith('/') ||
    // « //site-pirate.example » designe un AUTRE site pour le navigateur.
    retour.startsWith('//') ||
    // « /\site-pirate.example » aussi, pour certains navigateurs.
    retour.startsWith('/\\')
  ) {
    return '/';
  }

  return retour;
}
