import { prisma } from '../prisma';
import { Competition, DonneesCompetition, Univers } from '../modeles/competition';
import { CODE_PRISMA, aLeCodePrisma } from './erreurs-prisma';

/**
 * Un DEPOT (« repository ») est la seule porte d'entree vers la base pour un
 * type de donnee. Il remplace le dossier « donnees/ » de l'etape 4.
 *
 * Les controleurs ne connaissent donc jamais Prisma : ils appellent ces
 * fonctions. Si la base changeait un jour, seul ce dossier serait a reecrire.
 */

/** Toutes les competitions, ou celles d'un univers donne. */
export async function listerCompetitions(univers?: Univers): Promise<Competition[]> {
  return prisma.competition.findMany({
    // Si « univers » est absent, on ne filtre pas. Prisma ignore les
    // proprietes valant undefined, ce qui evite d'ecrire deux requetes.
    where: { univers },
    orderBy: { nom: 'asc' },
  });
}

/** Une competition precise, ou null si elle n'existe pas. */
export async function trouverCompetition(id: string): Promise<Competition | null> {
  return prisma.competition.findUnique({ where: { id } });
}

/*
 * ---------------------------------------------------------------------------
 * Etape 7 : les ecritures
 * ---------------------------------------------------------------------------
 *
 * Une ecriture peut echouer pour des raisons QUI NE SONT PAS DES BUGS : un
 * identifiant deja pris, une competition supprimee entre-temps. Ces cas-la
 * sont previsibles, et le controleur doit pouvoir y repondre precisement.
 *
 * Chaque fonction renvoie donc soit le resultat, soit un MOT qui nomme la
 * raison de l'echec : 'identifiant-pris', 'introuvable', 'utilisee'. Le type
 * de retour les enumere tous, et TypeScript oblige le controleur a les
 * traiter avant de pouvoir utiliser le resultat.
 *
 * Pourquoi pas null, comme trouverCompetition ? Parce que null ne dit pas
 * POURQUOI ca a echoue -- et une suppression peut echouer pour deux raisons
 * differentes, qui appellent deux reponses differentes.
 *
 * Toute AUTRE erreur (base injoignable...) est relancee par « throw » : elle
 * n'est pas previsible, et finira dans le gestionnaire d'erreurs (HTTP 500).
 */

/** INSERT : cree une competition. */
export async function insererCompetition(
  competition: Competition,
): Promise<Competition | 'identifiant-pris'> {
  try {
    // Le « await » n'est pas superflu. Sans lui, la fonction renverrait la
    // promesse AVANT qu'elle n'echoue, en sortant du bloc try : l'erreur
    // surviendrait ensuite, hors de portee du catch ci-dessous.
    return await prisma.competition.create({ data: competition });
  } catch (erreur) {
    // On ne verifie PAS l'existence avant de creer (« findUnique puis
    // create ») : entre les deux requetes, quelqu'un d'autre pourrait creer
    // le meme identifiant. C'est la base, seule a voir toutes les ecritures,
    // qui tranche -- et on interprete son refus.
    if (aLeCodePrisma(erreur, CODE_PRISMA.valeurDejaPrise)) {
      return 'identifiant-pris';
    }
    throw erreur;
  }
}

/**
 * UPDATE : remplace les informations modifiables d'une competition existante.
 *
 * Etape 10 : « data » ne contient que le nom, l'organisateur et la
 * description. Prisma ne touche pas aux colonnes absentes de « data » : la
 * discipline et l'univers restent tels quels.
 */
export async function mettreAJourCompetition(
  id: string,
  donnees: DonneesCompetition,
): Promise<Competition | 'introuvable'> {
  try {
    return await prisma.competition.update({ where: { id }, data: donnees });
  } catch (erreur) {
    if (aLeCodePrisma(erreur, CODE_PRISMA.introuvable)) {
      return 'introuvable';
    }
    throw erreur;
  }
}

/** DELETE : supprime une competition. */
export async function effacerCompetition(id: string): Promise<'effacee' | 'introuvable' | 'utilisee'> {
  try {
    await prisma.competition.delete({ where: { id } });
    return 'effacee';
  } catch (erreur) {
    if (aLeCodePrisma(erreur, CODE_PRISMA.introuvable)) {
      return 'introuvable';
    }
    // La cle etrangere de matchs.competition_id est en « ON DELETE RESTRICT »
    // (voir la migration de l'etape 6) : PostgreSQL refuse de supprimer une
    // competition tant que des matchs y font reference.
    if (aLeCodePrisma(erreur, CODE_PRISMA.cleEtrangere)) {
      return 'utilisee';
    }
    throw erreur;
  }
}
