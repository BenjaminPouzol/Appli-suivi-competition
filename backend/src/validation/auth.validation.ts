import { DonneesConnexion, DonneesInscription } from '../modeles/utilisateur';
import { CORPS_ABSENT, ErreurChamp, ResultatValidation, estObjet, lireTexte } from './validation';

/**
 * Forme generale d'une adresse email : quelque chose, une arobase, quelque
 * chose, un point, quelque chose -- sans espace.
 *
 * Volontairement tolerante. La norme des adresses email est si complexe
 * qu'une expression « parfaite » refuserait des adresses reelles. Le seul
 * moyen fiable de savoir qu'une adresse existe est d'y envoyer un message ;
 * on se contente ici d'ecarter les fautes de frappe evidentes.
 */
const FORMAT_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Longueurs acceptees pour un mot de passe.
 *
 * 12 caracteres minimum : la longueur est ce qui rend un mot de passe
 * difficile a deviner, bien plus que les chiffres ou symboles imposes. Une
 * phrase de passe comme « trois chats sur un toit » est a la fois longue et
 * memorisable.
 *
 * 128 maximum : Argon2 est volontairement lent et gourmand en memoire. Sans
 * plafond, un attaquant pourrait envoyer des mots de passe de plusieurs
 * megaoctets pour epuiser le serveur.
 */
const MOT_DE_PASSE_MIN = 12;
const MOT_DE_PASSE_MAX = 128;

/** Lit une adresse email, ramenee en minuscules. */
function lireEmail(corps: Record<string, unknown>, erreurs: ErreurChamp[]): string {
  // 254 caracteres : la longueur maximale d'une adresse email valide.
  const email = lireTexte(corps, 'email', 254, erreurs).toLowerCase();

  if (email !== '' && !FORMAT_EMAIL.test(email)) {
    erreurs.push({ champ: 'email', message: 'Adresse email invalide.' });
  }

  // Les minuscules evitent qu'« Alice@exemple.fr » et « alice@exemple.fr »
  // deviennent deux comptes differents -- ou qu'on ne puisse plus se
  // connecter pour avoir tape une majuscule.
  return email;
}

/** Valide ce qu'un client envoie pour creer un compte. */
export function validerInscription(corps: unknown): ResultatValidation<DonneesInscription> {
  if (!estObjet(corps)) {
    return { valide: false, erreurs: [CORPS_ABSENT] };
  }

  const erreurs: ErreurChamp[] = [];

  const email = lireEmail(corps, erreurs);

  const pseudo = lireTexte(corps, 'pseudo', 30, erreurs);
  if (pseudo !== '' && pseudo.length < 2) {
    erreurs.push({ champ: 'pseudo', message: '2 caractères minimum.' });
  }

  // Le mot de passe n'est PAS nettoye avec trim() : un espace au debut ou a
  // la fin fait partie du mot de passe choisi. Le retirer en silence
  // empecherait ensuite la connexion.
  const motDePasse = corps['motDePasse'];
  if (typeof motDePasse !== 'string' || motDePasse.length < MOT_DE_PASSE_MIN) {
    erreurs.push({ champ: 'motDePasse', message: `${MOT_DE_PASSE_MIN} caractères minimum.` });
  } else if (motDePasse.length > MOT_DE_PASSE_MAX) {
    erreurs.push({ champ: 'motDePasse', message: `${MOT_DE_PASSE_MAX} caractères maximum.` });
  }

  if (erreurs.length > 0 || typeof motDePasse !== 'string') {
    return { valide: false, erreurs };
  }

  // Liste blanche, comme a l'etape 7 : un « role » glisse dans le corps
  // n'ira nulle part.
  return { valide: true, donnees: { email, pseudo, motDePasse } };
}

/**
 * Valide ce qu'un client envoie pour se connecter.
 *
 * On verifie seulement la PRESENCE des champs, pas les regles de longueur.
 * Si la politique des mots de passe se durcit un jour (16 caracteres au lieu
 * de 12), les comptes crees avant doivent toujours pouvoir se connecter.
 */
export function validerConnexion(corps: unknown): ResultatValidation<DonneesConnexion> {
  if (!estObjet(corps)) {
    return { valide: false, erreurs: [CORPS_ABSENT] };
  }

  const erreurs: ErreurChamp[] = [];

  const email = lireTexte(corps, 'email', 254, erreurs).toLowerCase();

  const motDePasse = corps['motDePasse'];
  if (typeof motDePasse !== 'string' || motDePasse === '') {
    erreurs.push({ champ: 'motDePasse', message: 'Ce champ est obligatoire.' });
  } else if (motDePasse.length > MOT_DE_PASSE_MAX) {
    erreurs.push({ champ: 'motDePasse', message: `${MOT_DE_PASSE_MAX} caractères maximum.` });
  }

  if (erreurs.length > 0 || typeof motDePasse !== 'string') {
    return { valide: false, erreurs };
  }

  return { valide: true, donnees: { email, motDePasse } };
}
