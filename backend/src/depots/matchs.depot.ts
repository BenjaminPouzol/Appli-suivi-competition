import { prisma } from '../prisma';
import { DonneesMatch, Match, StatutMatch } from '../modeles/match';
import { Prisma } from '../generated/prisma/client';
import { StatutMatch as StatutEnBase } from '../generated/prisma/enums';
import { CODE_PRISMA, aLeCodePrisma } from './erreurs-prisma';

/**
 * Les statuts ne s'ecrivent pas pareil des deux cotes.
 *
 * PostgreSQL n'accepte pas de tiret dans le nom d'une valeur d'enum : la base
 * stocke donc « en_direct ». Mais l'API expose « en-direct » depuis l'etape 4,
 * et le frontend s'en sert.
 *
 * Plutot que de casser le contrat de l'API pour arranger la base -- ce qui
 * obligerait a modifier le frontend --, on traduit ici, a la frontiere.
 * C'est le role d'un depot : absorber les differences de representation.
 */
const VERS_LA_BASE: Record<StatutMatch, StatutEnBase> = {
  'a-venir': 'a_venir',
  'en-direct': 'en_direct',
  termine: 'termine',
};

const VERS_L_API: Record<StatutEnBase, StatutMatch> = {
  a_venir: 'a-venir',
  en_direct: 'en-direct',
  termine: 'termine',
};

/**
 * « include » demande a Prisma de rapporter aussi les lignes liees.
 * Sans lui, on n'aurait que domicileId et exterieurId, et il faudrait
 * une requete supplementaire par match pour obtenir les noms.
 *
 * Etape 7 : quatre fonctions en ont besoin, d'ou cette constante partagee.
 */
const AVEC_EQUIPES = { domicile: true, exterieur: true } as const;

/** Une ligne de la table matchs, accompagnee de ses deux equipes. */
type LigneMatch = Prisma.MatchGetPayload<{ include: typeof AVEC_EQUIPES }>;

/**
 * Traduit une ligne de la base en match tel que l'API l'expose.
 *
 * Etape 7 : ce code vivait dans listerMatchs. Trois nouvelles fonctions
 * renvoient un match ; plutot que de recopier la traduction quatre fois, on
 * l'isole ici. Une correction future ne se fera ainsi qu'a un seul endroit.
 */
function versApi(ligne: LigneMatch): Match {
  return {
    id: ligne.id,
    competitionId: ligne.competitionId,
    domicile: ligne.domicile,
    exterieur: ligne.exterieur,
    scoreDomicile: ligne.scoreDomicile,
    scoreExterieur: ligne.scoreExterieur,
    // La base renvoie un objet Date ; l'API expose du texte ISO, puisque
    // le JSON ne connait pas les dates (voir etape 5).
    date: ligne.date.toISOString(),
    statut: VERS_L_API[ligne.statut],
  };
}

/** Le chemin inverse : des donnees validees vers les colonnes de la base. */
function versLaBase(donnees: DonneesMatch) {
  return {
    competitionId: donnees.competitionId,
    domicileId: donnees.domicileId,
    exterieurId: donnees.exterieurId,
    scoreDomicile: donnees.scoreDomicile,
    scoreExterieur: donnees.scoreExterieur,
    // Le texte « 2026-09-15T16:00:00.000Z » devient un objet Date. Comme il
    // porte son fuseau (la validation l'exige), aucune ambiguite possible.
    date: new Date(donnees.date),
    statut: VERS_LA_BASE[donnees.statut],
  };
}

/** Tous les matchs, ou ceux d'un statut donne, par ordre chronologique. */
export async function listerMatchs(statut?: StatutMatch): Promise<Match[]> {
  const lignes = await prisma.match.findMany({
    where: statut ? { statut: VERS_LA_BASE[statut] } : {},
    include: AVEC_EQUIPES,
    orderBy: { date: 'asc' },
  });

  return lignes.map(versApi);
}

/** Etape 7 : un match precis, ou null s'il n'existe pas. */
export async function trouverMatch(id: string): Promise<Match | null> {
  const ligne = await prisma.match.findUnique({ where: { id }, include: AVEC_EQUIPES });
  return ligne === null ? null : versApi(ligne);
}

/*
 * ---------------------------------------------------------------------------
 * Etape 7 : les ecritures
 * ---------------------------------------------------------------------------
 *
 * Meme principe que dans competitions.depot.ts : chaque fonction renvoie le
 * resultat, ou un mot qui nomme la raison d'un echec previsible.
 */

/** INSERT : cree un match. Son identifiant est genere par @default(uuid()). */
export async function insererMatch(donnees: DonneesMatch): Promise<Match | 'reference-inconnue'> {
  try {
    const ligne = await prisma.match.create({
      data: versLaBase(donnees),
      // include fonctionne aussi a l'ecriture : Prisma renvoie le match cree
      // AVEC ses equipes, sans seconde requete.
      include: AVEC_EQUIPES,
    });
    return versApi(ligne);
  } catch (erreur) {
    // La competition ou l'une des equipes n'existe pas : PostgreSQL refuse
    // la ligne, puisque la cle etrangere pointerait dans le vide.
    if (aLeCodePrisma(erreur, CODE_PRISMA.cleEtrangere)) {
      return 'reference-inconnue';
    }
    throw erreur;
  }
}

/** UPDATE : remplace les informations d'un match existant. */
export async function mettreAJourMatch(
  id: string,
  donnees: DonneesMatch,
): Promise<Match | 'introuvable' | 'reference-inconnue'> {
  try {
    const ligne = await prisma.match.update({
      where: { id },
      data: versLaBase(donnees),
      include: AVEC_EQUIPES,
    });
    return versApi(ligne);
  } catch (erreur) {
    if (aLeCodePrisma(erreur, CODE_PRISMA.introuvable)) {
      return 'introuvable';
    }
    if (aLeCodePrisma(erreur, CODE_PRISMA.cleEtrangere)) {
      return 'reference-inconnue';
    }
    throw erreur;
  }
}

/** DELETE : supprime un match. Rien ne depend d'un match : pas de conflit possible. */
export async function effacerMatch(id: string): Promise<'efface' | 'introuvable'> {
  try {
    await prisma.match.delete({ where: { id } });
    return 'efface';
  } catch (erreur) {
    if (aLeCodePrisma(erreur, CODE_PRISMA.introuvable)) {
      return 'introuvable';
    }
    throw erreur;
  }
}
