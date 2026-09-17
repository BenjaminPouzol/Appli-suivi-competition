import { NextFunction, Request, Response } from 'express';
import {
  insererUtilisateur,
  sansEmpreinte,
  trouverPourConnexion,
  trouverUtilisateur,
} from '../depots/utilisateurs.depot';
import { ReponseAuthentification } from '../modeles/utilisateur';
import { creerJeton } from '../securite/jetons';
import {
  hacherMotDePasse,
  simulerVerification,
  verifierMotDePasse,
} from '../securite/mots-de-passe';
import { validerConnexion, validerInscription } from '../validation/auth.validation';
import { repondreDonneesInvalides } from './outils';

/**
 * Message unique pour un email inconnu ET pour un mot de passe faux.
 *
 * Deux messages differents (« compte introuvable » / « mot de passe
 * incorrect ») diraient a un attaquant quelles adresses ont un compte : il
 * n'aurait plus qu'a s'acharner sur celles-la. C'est l'ENUMERATION DE
 * COMPTES.
 */
const IDENTIFIANTS_INCORRECTS = { erreur: 'Email ou mot de passe incorrect' };

/** POST /api/auth/inscription  ->  cree un compte et connecte la personne. */
export async function inscrire(
  requete: Request,
  reponse: Response,
  suivant: NextFunction,
): Promise<void> {
  try {
    const validation = validerInscription(requete.body);

    if (!validation.valide) {
      repondreDonneesInvalides(reponse, validation.erreurs);
      return;
    }

    const { email, pseudo, motDePasse } = validation.donnees;

    const resultat = await insererUtilisateur({
      email,
      pseudo,
      // Le mot de passe en clair ne va pas plus loin que cette ligne.
      motDePasseHache: await hacherMotDePasse(motDePasse),
    });

    if (resultat === 'email-pris') {
      // Ici, l'enumeration est inevitable : pour aider la personne a
      // s'inscrire, il faut bien lui dire que l'adresse est deja utilisee. La
      // limitation des tentatives (middlewares/limitation.ts) en freine l'abus.
      reponse.status(409).json({ erreur: 'Un compte existe déjà avec cette adresse email' });
      return;
    }

    const corps: ReponseAuthentification = { utilisateur: resultat, jeton: creerJeton(resultat) };
    reponse.status(201).json(corps);
  } catch (erreur) {
    suivant(erreur);
  }
}

/** POST /api/auth/connexion  ->  verifie les identifiants et remet un jeton. */
export async function connecter(
  requete: Request,
  reponse: Response,
  suivant: NextFunction,
): Promise<void> {
  try {
    const validation = validerConnexion(requete.body);

    if (!validation.valide) {
      repondreDonneesInvalides(reponse, validation.erreurs);
      return;
    }

    const { email, motDePasse } = validation.donnees;
    const ligne = await trouverPourConnexion(email);

    if (ligne === null) {
      // Meme travail, meme duree, meme message qu'un mot de passe faux :
      // rien ne distingue une adresse inconnue d'une adresse existante.
      await simulerVerification(motDePasse);
      reponse.status(401).json(IDENTIFIANTS_INCORRECTS);
      return;
    }

    if (!(await verifierMotDePasse(ligne.motDePasseHache, motDePasse))) {
      reponse.status(401).json(IDENTIFIANTS_INCORRECTS);
      return;
    }

    const utilisateur = sansEmpreinte(ligne);
    const corps: ReponseAuthentification = { utilisateur, jeton: creerJeton(utilisateur) };
    reponse.json(corps);
  } catch (erreur) {
    suivant(erreur);
  }
}

/**
 * GET /api/auth/moi  ->  la personne connectee, relue en base.
 *
 * Protegee par authentifier() dans les routes : requete.utilisateur existe.
 */
export async function obtenirMoi(
  requete: Request,
  reponse: Response,
  suivant: NextFunction,
): Promise<void> {
  try {
    const identifiant = requete.utilisateur?.id ?? '';
    const utilisateur = await trouverUtilisateur(identifiant);

    if (utilisateur === null) {
      // Le jeton est valide, mais le compte a ete supprime depuis sa
      // creation. Pour le client, c'est une session qui n'a plus de sens.
      reponse.status(401).json({ erreur: 'Compte introuvable' });
      return;
    }

    reponse.json(utilisateur);
  } catch (erreur) {
    suivant(erreur);
  }
}
