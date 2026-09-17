import { NextFunction, Request, Response } from 'express';

/**
 * Un MIDDLEWARE est une fonction placee sur le trajet d'une requete, entre
 * son arrivee et la reponse. Elle peut l'inspecter, la modifier, l'arreter,
 * ou la laisser continuer vers la suite.
 *
 * Les deux middlewares ci-dessous sont des filets de securite. Ils se placent
 * APRES toutes les routes, et n'interviennent donc que si rien d'autre n'a
 * repondu.
 */

/** Aucune route ne correspond a l'adresse demandee. */
export function routeIntrouvable(requete: Request, reponse: Response): void {
  reponse.status(404).json({
    erreur: 'Route introuvable',
    chemin: requete.originalUrl,
  });
}

/**
 * Une erreur inattendue s'est produite pendant le traitement.
 *
 * Express reconnait un gestionnaire d'erreurs au fait qu'il prend QUATRE
 * parametres, le premier etant l'erreur. C'est une convention du framework :
 * avec trois parametres, cette fonction serait traitee comme un middleware
 * ordinaire et ne recevrait jamais les erreurs.
 */
export function gestionnaireErreurs(
  erreur: Error,
  _requete: Request,
  reponse: Response,
  _suivant: NextFunction,
): void {
  /*
   * Etape 7 : un cas particulier qui n'est PAS une erreur du serveur.
   *
   * Si un client envoie un corps qui n'est pas du JSON valide (une virgule en
   * trop, un guillemet oublie), express.json() echoue avant meme d'atteindre
   * nos controleurs, et transmet son erreur ici. Sans ce test, le client
   * recevrait un 500 -- « le serveur a un probleme » --, ce qui est faux :
   * c'est la requete qui est mal ecrite. Le bon code est 400.
   *
   * express.json() signale ce cas en posant type = 'entity.parse.failed'.
   */
  if ('type' in erreur && erreur.type === 'entity.parse.failed') {
    reponse.status(400).json({
      erreur: "Le corps de la requête n'est pas du JSON valide",
    });
    return;
  }

  // Meme logique pour un corps qui depasse la limite fixee dans app.ts.
  // 413 = « contenu trop volumineux ».
  if ('type' in erreur && erreur.type === 'entity.too.large') {
    reponse.status(413).json({
      erreur: 'Le corps de la requête est trop volumineux',
    });
    return;
  }

  // Le detail complet va dans les journaux du serveur, pour le developpeur.
  console.error('Erreur non geree :', erreur);

  // Mais PAS dans la reponse envoyee au client. Un message d'erreur brut peut
  // reveler la structure du code, des chemins de fichiers, voire des elements
  // de configuration -- autant d'informations utiles a un attaquant.
  reponse.status(500).json({
    erreur: 'Erreur interne du serveur',
  });
}
