import { NextFunction, Request, Response } from 'express';
import {
  RefusDetail,
  ecrireCarteValorant,
  ecrireFeuilleFootball,
  ecrirePartieLol,
  effacerCarteValorant,
  effacerPartieLol,
  trouverDetails,
} from '../depots/details.depot';
import {
  validerCarteValorant,
  validerFeuilleFootball,
  validerPartieLol,
} from '../validation/details.validation';
import { lireIdentifiant, lireParametre, repondreDonneesInvalides } from './outils';

/**
 * Etape 10 : le detail d'un match.
 *
 * Les controleurs d'ecriture suivent le deroule de l'etape 7 -- valider,
 * ecrire, traduire le resultat en code HTTP. La traduction des refus est
 * commune a tous : elle est ecrite une seule fois, dans ce tableau.
 */
const REPONSES_AUX_REFUS: Record<RefusDetail, { statut: number; erreur: string }> = {
  'match-introuvable': { statut: 404, erreur: 'Match introuvable' },
  'mauvaise-discipline': {
    statut: 409,
    erreur: "Ce détail ne correspond pas à la discipline de la compétition du match.",
  },
  'match-a-venir': {
    statut: 409,
    erreur: "Ce match n'a pas encore commencé : passe-le d'abord « en direct ».",
  },
  'joueurs-invalides': {
    statut: 400,
    erreur: 'Au moins un joueur est inconnu, ou pratique une autre discipline que ce match.',
  },
  'deux-manches-en-cours': {
    statut: 409,
    erreur: "Une autre manche de ce match est déjà en cours : indique d'abord son vainqueur.",
  },
  'manche-introuvable': { statut: 404, erreur: 'Aucune manche ne porte ce numéro dans ce match.' },
};

/** Une serie se joue en cinq manches au plus. */
const NUMERO_MAX = 5;

/**
 * Lit le « :numero » de l'adresse : un entier de 1 a 5, ou null.
 *
 * Number(« 2 ») vaut 2, mais Number(« deux ») vaut NaN et Number(« ») vaut
 * 0 : Number.isInteger et les bornes ecartent tous les cas invalides.
 */
function lireNumero(requete: Request): number | null {
  const numero = Number(lireParametre(requete, 'numero'));
  return Number.isInteger(numero) && numero >= 1 && numero <= NUMERO_MAX ? numero : null;
}

function refuserNumero(reponse: Response): void {
  reponse.status(400).json({ erreur: `Numéro de manche invalide : entier de 1 à ${NUMERO_MAX} attendu.` });
}

/**
 * Repond a une ecriture : le detail a jour (200) en cas de succes, pour que
 * le client voie aussitot le score recalcule ; le code prevu sinon.
 */
async function repondreApresEcriture(
  reponse: Response,
  matchId: string,
  resultat: 'enregistre' | RefusDetail,
): Promise<void> {
  if (resultat !== 'enregistre') {
    const { statut, erreur } = REPONSES_AUX_REFUS[resultat];
    reponse.status(statut).json({ erreur });
    return;
  }
  reponse.json(await trouverDetails(matchId));
}

/** Meme chose pour une suppression : 204, sans corps, comme les autres DELETE. */
function repondreApresSuppression(reponse: Response, resultat: 'enregistre' | RefusDetail): void {
  if (resultat !== 'enregistre') {
    const { statut, erreur } = REPONSES_AUX_REFUS[resultat];
    reponse.status(statut).json({ erreur });
    return;
  }
  reponse.status(204).end();
}

/** GET /api/matchs/:id/details  ->  le match, sa competition et ses statistiques. */
export async function obtenirDetails(
  requete: Request,
  reponse: Response,
  suivant: NextFunction,
): Promise<void> {
  try {
    const identifiant = lireIdentifiant(requete);
    const details = await trouverDetails(identifiant);

    if (details === null) {
      reponse.status(404).json({ erreur: 'Match introuvable', id: identifiant });
      return;
    }

    reponse.json(details);
  } catch (erreur) {
    suivant(erreur);
  }
}

/** PUT /api/matchs/:id/feuille-football  ->  remplace buts et statistiques. */
export async function modifierFeuilleFootball(
  requete: Request,
  reponse: Response,
  suivant: NextFunction,
): Promise<void> {
  try {
    const identifiant = lireIdentifiant(requete);
    const validation = validerFeuilleFootball(requete.body);

    if (!validation.valide) {
      repondreDonneesInvalides(reponse, validation.erreurs);
      return;
    }

    const resultat = await ecrireFeuilleFootball(identifiant, validation.donnees);
    await repondreApresEcriture(reponse, identifiant, resultat);
  } catch (erreur) {
    suivant(erreur);
  }
}

/** PUT /api/matchs/:id/parties/:numero  ->  cree ou remplace une partie. */
export async function modifierPartie(
  requete: Request,
  reponse: Response,
  suivant: NextFunction,
): Promise<void> {
  try {
    const identifiant = lireIdentifiant(requete);
    const numero = lireNumero(requete);
    if (numero === null) {
      refuserNumero(reponse);
      return;
    }

    const validation = validerPartieLol(requete.body);
    if (!validation.valide) {
      repondreDonneesInvalides(reponse, validation.erreurs);
      return;
    }

    const resultat = await ecrirePartieLol(identifiant, numero, validation.donnees);
    await repondreApresEcriture(reponse, identifiant, resultat);
  } catch (erreur) {
    suivant(erreur);
  }
}

/** DELETE /api/matchs/:id/parties/:numero */
export async function supprimerPartie(
  requete: Request,
  reponse: Response,
  suivant: NextFunction,
): Promise<void> {
  try {
    const numero = lireNumero(requete);
    if (numero === null) {
      refuserNumero(reponse);
      return;
    }

    repondreApresSuppression(reponse, await effacerPartieLol(lireIdentifiant(requete), numero));
  } catch (erreur) {
    suivant(erreur);
  }
}

/** PUT /api/matchs/:id/cartes/:numero  ->  cree ou remplace une carte. */
export async function modifierCarte(
  requete: Request,
  reponse: Response,
  suivant: NextFunction,
): Promise<void> {
  try {
    const identifiant = lireIdentifiant(requete);
    const numero = lireNumero(requete);
    if (numero === null) {
      refuserNumero(reponse);
      return;
    }

    const validation = validerCarteValorant(requete.body);
    if (!validation.valide) {
      repondreDonneesInvalides(reponse, validation.erreurs);
      return;
    }

    const resultat = await ecrireCarteValorant(identifiant, numero, validation.donnees);
    await repondreApresEcriture(reponse, identifiant, resultat);
  } catch (erreur) {
    suivant(erreur);
  }
}

/** DELETE /api/matchs/:id/cartes/:numero */
export async function supprimerCarte(
  requete: Request,
  reponse: Response,
  suivant: NextFunction,
): Promise<void> {
  try {
    const numero = lireNumero(requete);
    if (numero === null) {
      refuserNumero(reponse);
      return;
    }

    repondreApresSuppression(reponse, await effacerCarteValorant(lireIdentifiant(requete), numero));
  } catch (erreur) {
    suivant(erreur);
  }
}
