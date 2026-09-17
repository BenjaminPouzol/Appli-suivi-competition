import { Competition, DonneesCompetition, Univers } from '../modeles/competition';
import { CORPS_ABSENT, ErreurChamp, ResultatValidation, estObjet, lireTexte } from './validation';

/**
 * Format d'un identifiant de competition : minuscules, chiffres et tirets,
 * sans tiret au debut ni a la fin. Exemples valides : « lol », « ligue1 »,
 * « coupe-de-france ».
 *
 * Pourquoi etre si strict ? L'identifiant apparait dans les adresses
 * (/api/competitions/ligue1) et dans le CSS du frontend
 * ([data-competition='lol']). Un espace, un accent ou une barre oblique y
 * causeraient des problemes difficiles a comprendre.
 */
const FORMAT_IDENTIFIANT = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const UNIVERS_VALIDES: Univers[] = ['esport', 'football'];

/**
 * Valide ce qu'un client envoie pour MODIFIER une competition (PUT).
 *
 * Remarque la construction de l'objet renvoye : on recopie un a un les champs
 * attendus, au lieu de renvoyer le corps tel quel. C'est une LISTE BLANCHE.
 * Un champ inattendu glisse par le client -- par exemple « id » -- est ainsi
 * ignore, et n'atteint jamais la base.
 */
export function validerDonneesCompetition(corps: unknown): ResultatValidation<DonneesCompetition> {
  if (!estObjet(corps)) {
    return { valide: false, erreurs: [CORPS_ABSENT] };
  }

  const erreurs: ErreurChamp[] = [];

  const nom = lireTexte(corps, 'nom', 80, erreurs);
  const organisateur = lireTexte(corps, 'organisateur', 80, erreurs);
  const description = lireTexte(corps, 'description', 500, erreurs);

  const univers = corps['univers'];
  if (!UNIVERS_VALIDES.includes(univers as Univers)) {
    erreurs.push({ champ: 'univers', message: 'Univers attendu : esport ou football.' });
  }

  if (erreurs.length > 0) {
    return { valide: false, erreurs };
  }

  return {
    valide: true,
    // L'objet est RECONSTRUIT champ par champ : tout ce que le client aurait
    // ajoute d'autre (« id », « role »...) reste a la porte.
    donnees: { nom, organisateur, univers: univers as Univers, description },
  };
}

/**
 * Valide ce qu'un client envoie pour CREER une competition (POST).
 *
 * Memes regles que pour une modification, plus l'identifiant : a la creation,
 * c'est le client qui le choisit.
 */
export function validerNouvelleCompetition(corps: unknown): ResultatValidation<Competition> {
  if (!estObjet(corps)) {
    return { valide: false, erreurs: [CORPS_ABSENT] };
  }

  const erreurs: ErreurChamp[] = [];

  const id = lireTexte(corps, 'id', 30, erreurs);
  if (id !== '' && !FORMAT_IDENTIFIANT.test(id)) {
    erreurs.push({
      champ: 'id',
      message: 'Minuscules, chiffres et tirets uniquement (exemple : coupe-de-france).',
    });
  }

  // On reutilise la validation des autres champs plutot que de la recopier :
  // les regles ne peuvent ainsi pas diverger entre creation et modification.
  const reste = validerDonneesCompetition(corps);
  if (!reste.valide) {
    erreurs.push(...reste.erreurs);
  }

  if (erreurs.length > 0 || !reste.valide) {
    return { valide: false, erreurs };
  }

  return { valide: true, donnees: { id, ...reste.donnees } };
}
