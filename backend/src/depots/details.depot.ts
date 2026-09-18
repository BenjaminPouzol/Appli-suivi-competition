import { prisma } from '../prisma';
import { Prisma } from '../generated/prisma/client';
import { Discipline } from '../modeles/competition';
import {
  CarteValorant,
  Cote,
  DetailsFootball,
  DetailsLol,
  DetailsMatch,
  DetailsValorant,
  DonneesCarteValorant,
  DonneesFeuilleFootball,
  DonneesPartieLol,
  PartieLol,
  StatistiquesFootball,
} from '../modeles/details';
import { COTES } from '../validation/details.validation';
import { trouverCompetition } from './competitions.depot';
import { trouverMatch } from './matchs.depot';
import { CODE_PRISMA, aLeCodePrisma } from './erreurs-prisma';

/**
 * Etape 10 : le detail des matchs -- lecture et ecriture.
 *
 * Toutes les ecritures suivent le meme deroule, DANS UNE TRANSACTION :
 *
 *   1. verifier que le match existe et peut recevoir ce detail ;
 *   2. verifier que les joueurs cites existent, dans la bonne discipline ;
 *   3. remplacer le detail ;
 *   4. recalculer le score du match a partir du detail.
 *
 * Si l'une de ces etapes echoue, AUCUNE n'a eu lieu : c'est tout l'interet
 * d'une transaction (voir le document d'apprentissage, etape 10 § 2.5).
 */

/** Le client que Prisma passe aux fonctions executees dans une transaction. */
type Transaction = Prisma.TransactionClient;

/** Ce qu'il faut rapporter d'un joueur pour l'afficher : son nom, pas plus. */
const JOUEUR_RESUME = { select: { id: true, nom: true } } as const;

/** Additionne une liste de nombres. */
function somme(valeurs: number[]): number {
  return valeurs.reduce((total, valeur) => total + valeur, 0);
}

/**
 * Range des lignes en deux paquets, un par cote.
 *
 * « T extends { cote: Cote } » : la fonction accepte n'importe quelles
 * lignes, pourvu qu'elles aient un cote. Elle sert aux joueurs de League of
 * Legends comme a ceux de Valorant.
 */
function parCote<T extends { cote: Cote }>(lignes: T[]): Record<Cote, T[]> {
  return {
    domicile: lignes.filter((ligne) => ligne.cote === 'domicile'),
    exterieur: lignes.filter((ligne) => ligne.cote === 'exterieur'),
  };
}

/*
 * ---------------------------------------------------------------------------
 * Lecture
 * ---------------------------------------------------------------------------
 */

/**
 * Le detail d'un match, ou null s'il n'existe pas.
 *
 * On reutilise trouverMatch et trouverCompetition plutot que de les
 * reecrire : la traduction d'un match pour l'API (statuts, dates) reste
 * ainsi a un seul endroit.
 */
export async function trouverDetails(matchId: string): Promise<DetailsMatch | null> {
  const match = await trouverMatch(matchId);
  if (match === null) {
    return null;
  }

  const competition = await trouverCompetition(match.competitionId);
  if (competition === null) {
    // Impossible : la cle etrangere interdit un match sans competition, et
    // RESTRICT interdit de supprimer une competition qui a des matchs. Si
    // cela arrivait, ce serait un bug -- d'ou une erreur (500), pas un 404.
    throw new Error(`Compétition ${match.competitionId} introuvable pour le match ${matchId}`);
  }

  // La discipline dit quelles tables interroger. Les trois « case » couvrent
  // toutes les valeurs possibles : TypeScript sait que la fonction renvoie
  // toujours quelque chose.
  switch (competition.discipline) {
    case 'football':
      return { match, competition, ...(await detailsFootball(matchId)) };
    case 'lol':
      return { match, competition, ...(await detailsLol(matchId)) };
    case 'valorant':
      return { match, competition, ...(await detailsValorant(matchId)) };
  }
}

async function detailsFootball(matchId: string): Promise<DetailsFootball> {
  /*
   * Promise.all lance les deux requetes EN MEME TEMPS, et attend les deux.
   * C'est l'equivalent cote serveur du forkJoin de l'etape 5 : elles sont
   * independantes, les enchainer serait deux fois plus lent pour rien.
   */
  const [statistiques, buts] = await Promise.all([
    prisma.statistiquesFootball.findMany({ where: { matchId } }),
    prisma.but.findMany({
      where: { matchId },
      include: { buteur: JOUEUR_RESUME },
      // « 45+2 » (minute 45, temps additionnel 2) vient AVANT « 46 », et
      // « 90 » avant « 90+3 » : a minute egale, l'absence de temps
      // additionnel (NULL) passe en premier.
      orderBy: [{ minute: 'asc' }, { tempsAdditionnel: { sort: 'asc', nulls: 'first' } }],
    }),
  ]);

  const domicile = statistiques.find((ligne) => ligne.cote === 'domicile');
  const exterieur = statistiques.find((ligne) => ligne.cote === 'exterieur');

  return {
    discipline: 'football',
    statistiques:
      domicile && exterieur
        ? { domicile: statistiquesFootballVersApi(domicile), exterieur: statistiquesFootballVersApi(exterieur) }
        : null,
    buts: buts.map((but) => ({
      cote: but.cote,
      buteur: but.buteur,
      minute: but.minute,
      tempsAdditionnel: but.tempsAdditionnel,
      type: but.type,
    })),
  };
}

/** Une ligne de la table -> les seules statistiques (sans match_id ni cote). */
function statistiquesFootballVersApi(ligne: StatistiquesFootball): StatistiquesFootball {
  return {
    possession: ligne.possession,
    tirs: ligne.tirs,
    tirsCadres: ligne.tirsCadres,
    corners: ligne.corners,
    fautes: ligne.fautes,
    horsJeu: ligne.horsJeu,
    cartonsJaunes: ligne.cartonsJaunes,
    cartonsRouges: ligne.cartonsRouges,
    passes: ligne.passes,
    passesReussies: ligne.passesReussies,
    arrets: ligne.arrets,
  };
}

/**
 * Ce qu'il faut rapporter avec chaque partie. « include » s'imbrique : les
 * joueurs de la partie, et pour chacun, son nom.
 */
const AVEC_DETAIL_PARTIE = {
  equipes: true,
  joueurs: { include: { joueur: JOUEUR_RESUME }, orderBy: { poste: 'asc' } },
  dragons: { orderBy: { ordre: 'asc' } },
} as const;

type LignePartieLol = Prisma.PartieLolGetPayload<{ include: typeof AVEC_DETAIL_PARTIE }>;

async function detailsLol(matchId: string): Promise<DetailsLol> {
  const parties = await prisma.partieLol.findMany({
    where: { matchId },
    include: AVEC_DETAIL_PARTIE,
    orderBy: { numero: 'asc' },
  });
  return { discipline: 'lol', parties: parties.map(partieLolVersApi) };
}

function partieLolVersApi(partie: LignePartieLol): PartieLol {
  const joueurs = parCote(partie.joueurs);

  /** Une equipe : ses objectifs stockes, et ce qui se CALCULE a partir du reste. */
  const equipe = (cote: Cote) => {
    const objectifs = partie.equipes.find((ligne) => ligne.cote === cote);
    return {
      kills: somme(joueurs[cote].map((joueur) => joueur.kills)),
      gold: somme(joueurs[cote].map((joueur) => joueur.gold)),
      tours: objectifs?.tours ?? 0,
      inhibiteurs: objectifs?.inhibiteurs ?? 0,
      barons: objectifs?.barons ?? 0,
      herauts: objectifs?.herauts ?? 0,
      larves: objectifs?.larves ?? 0,
      dragons: partie.dragons.filter((dragon) => dragon.cote === cote).map((dragon) => dragon.type),
    };
  };

  const joueursVersApi = (cote: Cote) =>
    joueurs[cote].map((ligne) => ({
      joueur: ligne.joueur,
      poste: ligne.poste,
      champion: ligne.champion,
      kills: ligne.kills,
      morts: ligne.morts,
      assistances: ligne.assistances,
      sbires: ligne.sbires,
      gold: ligne.gold,
      niveau: ligne.niveau,
      objets: ligne.objets,
    }));

  return {
    numero: partie.numero,
    duree: partie.duree,
    coteBleu: partie.coteBleu,
    vainqueur: partie.vainqueur,
    equipes: { domicile: equipe('domicile'), exterieur: equipe('exterieur') },
    joueurs: { domicile: joueursVersApi('domicile'), exterieur: joueursVersApi('exterieur') },
  };
}

const AVEC_DETAIL_CARTE = {
  equipes: true,
  joueurs: { include: { joueur: JOUEUR_RESUME }, orderBy: { acs: 'desc' } },
} as const;

type LigneCarteValorant = Prisma.CarteValorantGetPayload<{ include: typeof AVEC_DETAIL_CARTE }>;

async function detailsValorant(matchId: string): Promise<DetailsValorant> {
  const cartes = await prisma.carteValorant.findMany({
    where: { matchId },
    include: AVEC_DETAIL_CARTE,
    orderBy: { numero: 'asc' },
  });
  return { discipline: 'valorant', cartes: cartes.map(carteValorantVersApi) };
}

function carteValorantVersApi(carte: LigneCarteValorant): CarteValorant {
  const joueurs = parCote(carte.joueurs);

  const equipe = (cote: Cote) => {
    const rounds = carte.equipes.find((ligne) => ligne.cote === cote);
    const roundsAttaque = rounds?.roundsAttaque ?? 0;
    const roundsDefense = rounds?.roundsDefense ?? 0;
    return { rounds: roundsAttaque + roundsDefense, roundsAttaque, roundsDefense };
  };

  const joueursVersApi = (cote: Cote) =>
    joueurs[cote].map((ligne) => ({
      joueur: ligne.joueur,
      agent: ligne.agent,
      kills: ligne.kills,
      morts: ligne.morts,
      assistances: ligne.assistances,
      acs: ligne.acs,
      adr: ligne.adr,
      tirsTete: ligne.tirsTete,
      premiersKills: ligne.premiersKills,
      premieresMorts: ligne.premieresMorts,
    }));

  return {
    numero: carte.numero,
    nom: carte.nom,
    vainqueur: carte.vainqueur,
    equipes: { domicile: equipe('domicile'), exterieur: equipe('exterieur') },
    joueurs: { domicile: joueursVersApi('domicile'), exterieur: joueursVersApi('exterieur') },
  };
}

/*
 * ---------------------------------------------------------------------------
 * Ecriture
 * ---------------------------------------------------------------------------
 */

/** Les raisons previsibles pour lesquelles une ecriture de detail est refusee. */
export type RefusDetail =
  | 'match-introuvable'
  | 'mauvaise-discipline'
  | 'match-a-venir'
  | 'joueurs-invalides'
  | 'deux-manches-en-cours'
  | 'manche-introuvable';

/**
 * Un refus prevu, LEVE a l'interieur d'une transaction.
 *
 * Lever une erreur dans la fonction passee a $transaction est la facon
 * d'annuler la transaction : Prisma defait alors tout ce qui a ete ecrit
 * depuis son debut. La classe porte la raison du refus, pour que
 * l'appelant puisse la distinguer d'une vraie panne.
 */
class Refus extends Error {
  readonly raison: RefusDetail;

  constructor(raison: RefusDetail) {
    super(`Écriture refusée : ${raison}`);
    this.raison = raison;
  }
}

/**
 * Le cadre commun a toutes les ecritures de detail.
 *
 * « ecrire » est la partie propre a chaque ecriture ; tout le reste --
 * verifications, transaction, recalcul du score, traduction des refus -- est
 * ecrit une seule fois ici.
 */
async function ecrireDansUnMatch(
  matchId: string,
  discipline: Discipline,
  joueurIds: string[],
  ecrire: (tx: Transaction) => Promise<void>,
): Promise<'enregistre' | RefusDetail> {
  try {
    // Toutes les requetes passees par « tx » font partie de la transaction.
    // Celles passees par « prisma » n'en feraient PAS partie : a l'interieur,
    // on n'utilise que tx.
    await prisma.$transaction(async (tx) => {
      const match = await tx.match.findUnique({
        where: { id: matchId },
        select: { statut: true, competition: { select: { discipline: true } } },
      });

      if (match === null) {
        throw new Refus('match-introuvable');
      }
      if (match.competition.discipline !== discipline) {
        throw new Refus('mauvaise-discipline');
      }
      // Un match qui n'a pas commence n'a ni but ni partie.
      if (match.statut === 'a_venir') {
        throw new Refus('match-a-venir');
      }

      await verifierJoueurs(tx, joueurIds, discipline);
      await ecrire(tx);
      await recalculerScore(tx, matchId, discipline);
    });
    return 'enregistre';
  } catch (erreur) {
    if (erreur instanceof Refus) {
      return erreur.raison;
    }
    // Un joueur supprime entre la verification et l'ecriture : la base, qui
    // a le dernier mot, refuse la cle etrangere.
    if (aLeCodePrisma(erreur, CODE_PRISMA.cleEtrangere)) {
      return 'joueurs-invalides';
    }
    throw erreur;
  }
}

/**
 * Tous les joueurs cites existent-ils, dans la discipline du match ?
 *
 * On verifie la DISCIPLINE, pas l'equipe actuelle : un joueur transfere
 * depuis doit pouvoir figurer dans le detail d'un match plus ancien.
 */
async function verifierJoueurs(tx: Transaction, joueurIds: string[], discipline: Discipline): Promise<void> {
  // Le meme buteur peut marquer deux fois : on compte les identifiants DISTINCTS.
  const distincts = new Set(joueurIds);
  if (distincts.size === 0) {
    return;
  }

  const trouves = await tx.joueur.count({ where: { id: { in: [...distincts] }, discipline } });
  if (trouves !== distincts.size) {
    throw new Refus('joueurs-invalides');
  }
}

/**
 * Recalcule le score du match a partir de son detail.
 *
 * Le score est une donnee DERIVEE : il se deduit des buts, ou des manches
 * gagnees. On le stocke quand meme dans la table matchs, parce que la liste
 * des matchs l'affiche a chaque visite -- mais on le recalcule ICI, dans la
 * meme transaction que l'ecriture du detail. Les deux ne peuvent donc jamais
 * se contredire.
 */
async function recalculerScore(tx: Transaction, matchId: string, discipline: Discipline): Promise<void> {
  const points = async (cote: Cote): Promise<number> => {
    switch (discipline) {
      case 'football':
        return tx.but.count({ where: { matchId, cote } });
      case 'lol':
        return tx.partieLol.count({ where: { matchId, vainqueur: cote } });
      case 'valorant':
        return tx.carteValorant.count({ where: { matchId, vainqueur: cote } });
    }
  };

  await tx.match.update({
    where: { id: matchId },
    data: {
      scoreDomicile: await points('domicile'),
      scoreExterieur: await points('exterieur'),
      scoreCalcule: true,
    },
  });
}

/**
 * PUT /api/matchs/:id/feuille-football
 *
 * REMPLACE tout le detail du match : les anciennes statistiques et les
 * anciens buts sont supprimes, les nouveaux crees. Comparer l'ancien et le
 * nouveau pour ne toucher qu'aux differences serait bien plus complique,
 * pour un resultat identique.
 */
export async function ecrireFeuilleFootball(
  matchId: string,
  donnees: DonneesFeuilleFootball,
): Promise<'enregistre' | RefusDetail> {
  const buteurs = donnees.buts.map((but) => but.buteurId);

  return ecrireDansUnMatch(matchId, 'football', buteurs, async (tx) => {
    await tx.statistiquesFootball.deleteMany({ where: { matchId } });
    await tx.but.deleteMany({ where: { matchId } });

    // Une constante locale : TypeScript garde ainsi en memoire, dans la
    // fonction flechee ci-dessous, qu'elle n'est pas null.
    const statistiques = donnees.statistiques;
    if (statistiques !== null) {
      await tx.statistiquesFootball.createMany({
        data: COTES.map((cote) => ({ matchId, cote, ...statistiques[cote] })),
      });
    }

    await tx.but.createMany({ data: donnees.buts.map((but) => ({ matchId, ...but })) });
  });
}

/**
 * Une manche au plus en cours par match. La regle porte sur TOUTES les
 * manches du match : elle ne se verifie qu'une fois la nouvelle ecrite. Si
 * elle echoue, le Refus annule la transaction -- et donc l'ecriture.
 */
async function refuserDeuxManchesEnCours(mancheEnCours: Promise<number>): Promise<void> {
  if ((await mancheEnCours) > 1) {
    throw new Refus('deux-manches-en-cours');
  }
}

/** PUT /api/matchs/:id/parties/:numero -- cree ou remplace une partie. */
export async function ecrirePartieLol(
  matchId: string,
  numero: number,
  donnees: DonneesPartieLol,
): Promise<'enregistre' | RefusDetail> {
  // Les joueurs arrivent ranges par cote ; en base, le cote est une colonne.
  const joueurs = COTES.flatMap((cote) => donnees.joueurs[cote].map((joueur) => ({ ...joueur, cote })));

  return ecrireDansUnMatch(
    matchId,
    'lol',
    joueurs.map((joueur) => joueur.joueurId),
    async (tx) => {
      // Remplacer plutot que comparer, ici aussi. Supprimer la partie
      // supprime en cascade ses statistiques et ses dragons.
      await tx.partieLol.deleteMany({ where: { matchId, numero } });

      // Une ecriture IMBRIQUEE : la partie, ses deux lignes d'equipe, ses
      // joueurs et ses dragons, en une seule instruction. Prisma remplit
      // lui-meme partie_id dans chaque ligne liee.
      await tx.partieLol.create({
        data: {
          matchId,
          numero,
          duree: donnees.duree,
          coteBleu: donnees.coteBleu,
          vainqueur: donnees.vainqueur,
          equipes: { create: COTES.map((cote) => ({ cote, ...donnees.equipes[cote] })) },
          joueurs: { create: joueurs },
          dragons: {
            create: donnees.dragons.map((dragon, index) => ({ ordre: index + 1, ...dragon })),
          },
        },
      });

      await refuserDeuxManchesEnCours(tx.partieLol.count({ where: { matchId, vainqueur: null } }));
    },
  );
}

/** DELETE /api/matchs/:id/parties/:numero */
export async function effacerPartieLol(matchId: string, numero: number): Promise<'enregistre' | RefusDetail> {
  return ecrireDansUnMatch(matchId, 'lol', [], async (tx) => {
    const { count } = await tx.partieLol.deleteMany({ where: { matchId, numero } });
    if (count === 0) {
      throw new Refus('manche-introuvable');
    }
  });
}

/** PUT /api/matchs/:id/cartes/:numero -- cree ou remplace une carte. */
export async function ecrireCarteValorant(
  matchId: string,
  numero: number,
  donnees: DonneesCarteValorant,
): Promise<'enregistre' | RefusDetail> {
  const joueurs = COTES.flatMap((cote) => donnees.joueurs[cote].map((joueur) => ({ ...joueur, cote })));

  return ecrireDansUnMatch(
    matchId,
    'valorant',
    joueurs.map((joueur) => joueur.joueurId),
    async (tx) => {
      await tx.carteValorant.deleteMany({ where: { matchId, numero } });

      await tx.carteValorant.create({
        data: {
          matchId,
          numero,
          nom: donnees.nom,
          vainqueur: donnees.vainqueur,
          equipes: { create: COTES.map((cote) => ({ cote, ...donnees.equipes[cote] })) },
          joueurs: { create: joueurs },
        },
      });

      await refuserDeuxManchesEnCours(tx.carteValorant.count({ where: { matchId, vainqueur: null } }));
    },
  );
}

/** DELETE /api/matchs/:id/cartes/:numero */
export async function effacerCarteValorant(
  matchId: string,
  numero: number,
): Promise<'enregistre' | RefusDetail> {
  return ecrireDansUnMatch(matchId, 'valorant', [], async (tx) => {
    const { count } = await tx.carteValorant.deleteMany({ where: { matchId, numero } });
    if (count === 0) {
      throw new Refus('manche-introuvable');
    }
  });
}
