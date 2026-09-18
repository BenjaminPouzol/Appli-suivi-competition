import { Competition } from '../app/modeles/competition';
import { Equipe } from '../app/modeles/equipe';
import { MatchApi, StatutMatch } from '../app/modeles/match';
import {
  CarteValorant,
  Cote,
  DetailsMatchApi,
  DetailsParDiscipline,
  JoueurCarteValorant,
  JoueurPartieLol,
  PartieLol,
  PosteLol,
} from '../app/modeles/details';

/**
 * Etape 10 : des donnees de detail pour les TESTS uniquement.
 *
 * Quatre fichiers de test en ont besoin. Les fabriquer ici evite de recopier
 * des dizaines de lignes dans chacun -- et de devoir corriger quatre copies
 * le jour ou le format change. Comme jetons-de-test.ts, ce fichier ne fait
 * pas partie de l'application construite.
 */

export const KC: Equipe = { id: 'kc', nom: 'Karmine Corp', trigramme: 'KC' };
export const G2: Equipe = { id: 'g2', nom: 'G2 Esports', trigramme: 'G2' };
export const PSG: Equipe = { id: 'psg', nom: 'Paris Saint-Germain', trigramme: 'PSG' };
export const OM: Equipe = { id: 'om', nom: 'Olympique de Marseille', trigramme: 'OM' };

/** Un match tel que l'API le renvoie (date en texte). */
export function matchApi(
  statut: StatutMatch,
  domicile: Equipe = KC,
  exterieur: Equipe = G2,
  score: [number, number] = [1, 0],
): MatchApi {
  const commence = statut !== 'a-venir';
  return {
    id: 'm1',
    competitionId: 'test',
    domicile,
    exterieur,
    scoreDomicile: commence ? score[0] : null,
    scoreExterieur: commence ? score[1] : null,
    date: '2026-09-14T15:00:00.000Z',
    statut,
    scoreCalcule: commence,
  };
}

const COMPETITIONS: Record<DetailsParDiscipline['discipline'], Competition> = {
  football: {
    id: 'test',
    nom: 'Ligue 1',
    organisateur: 'LFP',
    univers: 'football',
    discipline: 'football',
    description: '',
  },
  lol: {
    id: 'test',
    nom: 'League of Legends',
    organisateur: 'Riot Games',
    univers: 'esport',
    discipline: 'lol',
    description: '',
  },
  valorant: {
    id: 'test',
    nom: 'Valorant',
    organisateur: 'Riot Games',
    univers: 'esport',
    discipline: 'valorant',
    description: '',
  },
};

/** La reponse complete de GET /api/matchs/:id/details. */
export function detailsApi(match: MatchApi, detail: DetailsParDiscipline): DetailsMatchApi {
  return { match, competition: COMPETITIONS[detail.discipline], ...detail };
}

// --- League of Legends ------------------------------------------------------

function joueurLol(id: string, poste: PosteLol, kills: number, gold: number): JoueurPartieLol {
  return {
    joueur: { id, nom: id.toUpperCase() },
    poste,
    champion: 'Ahri',
    kills,
    morts: 1,
    assistances: 2,
    sbires: 150,
    gold,
    niveau: 12,
    objets: ["Luden's Companion", "Sorcerer's Shoes"],
  };
}

/** Une partie, avec un joueur par equipe : assez pour tester l'affichage. */
export function partieLol(numero: number, vainqueur: Cote | null): PartieLol {
  const equipe = (kills: number, gold: number) => ({
    kills,
    gold,
    tours: 3,
    inhibiteurs: 0,
    barons: 0,
    herauts: 1,
    larves: 3,
    dragons: ['ocean' as const],
  });
  return {
    numero,
    duree: 1985,
    coteBleu: 'domicile',
    vainqueur,
    equipes: { domicile: equipe(7, 16990), exterieur: equipe(4, 12100) },
    joueurs: {
      domicile: [joueurLol(`kc-${numero}`, 'mid', 7, 16990)],
      exterieur: [joueurLol(`g2-${numero}`, 'mid', 4, 12100)],
    },
  };
}

// --- Valorant ---------------------------------------------------------------

function joueurValorant(id: string, kills: number, morts: number): JoueurCarteValorant {
  return {
    joueur: { id, nom: id.toUpperCase() },
    agent: 'Jett',
    kills,
    morts,
    assistances: 3,
    acs: 250,
    adr: 160,
    tirsTete: 25,
    premiersKills: 3,
    premieresMorts: 2,
  };
}

export function carteValorant(numero: number, nom: string, vainqueur: Cote | null): CarteValorant {
  return {
    numero,
    nom,
    vainqueur,
    equipes: {
      domicile: { rounds: 13, roundsAttaque: 7, roundsDefense: 6 },
      exterieur: { rounds: 9, roundsAttaque: 4, roundsDefense: 5 },
    },
    joueurs: {
      domicile: [joueurValorant(`kc-${numero}`, 22, 13)],
      exterieur: [joueurValorant(`g2-${numero}`, 13, 16)],
    },
  };
}
