/** Etape 8 : ce qu'une personne connectee a le droit de faire. */
export type Role = 'utilisateur' | 'administrateur';

/** Un compte, tel que l'API le renvoie (jamais d'empreinte de mot de passe). */
export interface Utilisateur {
  id: string;
  email: string;
  pseudo: string;
  role: Role;
  creeLe: string;
}

/**
 * Ce que l'application sait de la personne connectee, lu dans son jeton.
 *
 * L'expiration permet d'ignorer un jeton perime retrouve dans le stockage du
 * navigateur, sans attendre que le serveur le refuse.
 */
export interface UtilisateurConnecte {
  id: string;
  pseudo: string;
  role: Role;
  expiration: Date;
}

/** Ce qu'on envoie pour creer un compte. */
export interface DonneesInscription {
  email: string;
  pseudo: string;
  motDePasse: string;
}

/** Ce qu'on envoie pour se connecter. */
export interface DonneesConnexion {
  email: string;
  motDePasse: string;
}

/** Ce que l'API renvoie apres une inscription ou une connexion. */
export interface ReponseAuthentification {
  utilisateur: Utilisateur;
  jeton: string;
}
