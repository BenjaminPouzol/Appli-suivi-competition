import { HttpErrorResponse } from '@angular/common/http';

/**
 * Etape 7 : la forme des erreurs renvoyees par NOTRE backend.
 *
 * Toutes les reponses d'erreur de l'API ont un champ « erreur » ; celles de
 * validation (400) y ajoutent le detail par champ.
 */
interface CorpsErreurApi {
  erreur?: string;
  details?: { champ: string; message: string }[];
}

/**
 * Traduit une erreur HTTP en message lisible pour l'utilisateur.
 *
 * Le serveur a deja redige un message precis (« Cet identifiant est deja
 * utilise ») : autant l'afficher plutot que d'en inventer un autre.
 */
export function messageErreurApi(erreur: unknown, messageParDefaut: string): string {
  if (!(erreur instanceof HttpErrorResponse)) {
    return messageParDefaut;
  }

  // Statut 0 : aucune reponse n'est arrivee. Le serveur est eteint, le reseau
  // coupe, ou le navigateur a bloque la requete (CORS).
  if (erreur.status === 0) {
    return "L'API ne répond pas. Vérifie qu'elle est démarrée.";
  }

  const corps = erreur.error as CorpsErreurApi | null;

  if (corps?.details && corps.details.length > 0) {
    const messages = corps.details.map((detail) => `${detail.champ} : ${detail.message}`);
    return `${corps.erreur ?? messageParDefaut} — ${messages.join(' ')}`;
  }

  return corps?.erreur ?? messageParDefaut;
}

/** Le serveur a-t-il repondu avec ce code de statut ? */
export function aLeStatut(erreur: unknown, statut: number): boolean {
  return erreur instanceof HttpErrorResponse && erreur.status === statut;
}
