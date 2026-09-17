/** Etape 8 : ce qu'une personne connectee a le droit de faire. */
export type Role = 'utilisateur' | 'administrateur';

/**
 * Un utilisateur tel que l'API l'expose.
 *
 * L'empreinte du mot de passe n'y figure PAS, et ce n'est pas un oubli : ce
 * type est la liste blanche de ce qui peut sortir du serveur. Meme une
 * empreinte Argon2 ne doit jamais quitter la base -- elle permettrait a qui
 * la recupere de tester des mots de passe hors ligne, sans limite.
 */
export interface Utilisateur {
  id: string;
  email: string;
  pseudo: string;
  role: Role;
  /** Date d'inscription, en texte ISO (le JSON ne connait pas les dates). */
  creeLe: string;
}

/**
 * Ce que le serveur sait d'une personne connectee, a partir de son jeton.
 *
 * Volontairement minimal : le jeton est lisible par quiconque le possede
 * (voir etape 8, le JWT est signe mais pas chiffre). L'adresse email n'y
 * figure donc pas.
 */
export interface UtilisateurConnecte {
  id: string;
  pseudo: string;
  role: Role;
}

/** Ce qu'un client envoie pour creer un compte. */
export interface DonneesInscription {
  email: string;
  pseudo: string;
  motDePasse: string;
}

/** Ce qu'un client envoie pour se connecter. */
export interface DonneesConnexion {
  email: string;
  motDePasse: string;
}

/** Ce que l'API renvoie apres une inscription ou une connexion reussie. */
export interface ReponseAuthentification {
  utilisateur: Utilisateur;
  jeton: string;
}
