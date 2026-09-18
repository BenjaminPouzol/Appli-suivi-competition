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
    scoreCalcule: ligne.scoreCalcule,
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

/**
 * UPDATE : remplace les informations d'un match existant.
 *
 * Etape 10 : un match dont le score est calcule (scoreCalcule) a des
 * statistiques detaillees. Sa competition, ses equipes et son score en
 * decoulent : ils ne peuvent plus changer ici ('details-verrouilles'). Seuls
 * la date et le statut restent modifiables.
 */
export async function mettreAJourMatch(
  id: string,
  donnees: DonneesMatch,
): Promise<Match | 'introuvable' | 'reference-inconnue' | 'details-verrouilles'> {
  try {
    /*
     * Cas general : un match SANS detail se modifie librement.
     *
     * La condition « scoreCalcule: false » fait partie de la requete
     * elle-meme (UPDATE ... WHERE id = ... AND score_calcule = false). C'est
     * la base qui la verifie, au moment precis de l'ecriture : si un detail
     * est enregistre une milliseconde avant, la ligne ne correspond plus, et
     * rien n'est modifie. Lire d'abord puis ecrire ensuite laisserait une
     * fenetre entre les deux (la situation de concurrence de l'etape 7).
     *
     * updateMany, et non update : update exige un critere UNIQUE (l'id seul),
     * updateMany accepte n'importe quelle condition et renvoie le nombre de
     * lignes modifiees.
     */
    const { count } = await prisma.match.updateMany({
      where: { id, scoreCalcule: false },
      data: versLaBase(donnees),
    });

    if (count === 0) {
      // Aucune ligne modifiee : soit le match n'existe pas, soit il a des details.
      const resultat = await mettreAJourMatchDetaille(id, donnees);
      if (resultat !== 'modifie') {
        return resultat;
      }
    }

    const match = await trouverMatch(id);
    return match ?? 'introuvable';
  } catch (erreur) {
    if (aLeCodePrisma(erreur, CODE_PRISMA.cleEtrangere)) {
      return 'reference-inconnue';
    }
    throw erreur;
  }
}

/**
 * Etape 10 : modifie un match qui a des statistiques detaillees.
 *
 * La requete n'est acceptee que si elle laisse intactes la competition, les
 * equipes et le score -- c'est le cas du formulaire, qui les affiche sans
 * permettre de les changer. Seules la date et le statut sont ensuite ecrits :
 * meme si un detail modifiait le score entre-temps, cette ecriture ne
 * l'ecraserait pas.
 */
async function mettreAJourMatchDetaille(
  id: string,
  donnees: DonneesMatch,
): Promise<'modifie' | 'introuvable' | 'details-verrouilles'> {
  const actuel = await prisma.match.findUnique({ where: { id } });
  if (actuel === null) {
    return 'introuvable';
  }

  const verrouillesModifies =
    actuel.competitionId !== donnees.competitionId ||
    actuel.domicileId !== donnees.domicileId ||
    actuel.exterieurId !== donnees.exterieurId ||
    actuel.scoreDomicile !== donnees.scoreDomicile ||
    actuel.scoreExterieur !== donnees.scoreExterieur;

  if (verrouillesModifies) {
    return 'details-verrouilles';
  }

  await prisma.match.update({
    where: { id },
    data: { date: new Date(donnees.date), statut: VERS_LA_BASE[donnees.statut] },
  });
  return 'modifie';
}

/**
 * DELETE : supprime un match.
 *
 * Etape 10 : ses statistiques detaillees (buts, parties, cartes) dependent de
 * lui, en ON DELETE CASCADE : elles disparaissent avec lui. Pas de conflit
 * possible.
 */
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
