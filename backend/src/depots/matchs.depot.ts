import { prisma } from '../prisma';
import { Match, StatutMatch } from '../modeles/match';
import { StatutMatch as StatutEnBase } from '../generated/prisma/enums';

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

/** Tous les matchs, ou ceux d'un statut donne, par ordre chronologique. */
export async function listerMatchs(statut?: StatutMatch): Promise<Match[]> {
  const lignes = await prisma.match.findMany({
    where: statut ? { statut: VERS_LA_BASE[statut] } : {},

    // « include » demande a Prisma de rapporter aussi les lignes liees.
    // Sans lui, on n'aurait que domicileId et exterieurId, et il faudrait
    // une requete supplementaire par match pour obtenir les noms.
    include: { domicile: true, exterieur: true },

    orderBy: { date: 'asc' },
  });

  return lignes.map((ligne) => ({
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
  }));
}
