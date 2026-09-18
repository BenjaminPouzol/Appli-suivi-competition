import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

/**
 * Script de PEUPLEMENT (« seed ») : remplit une base vide avec un jeu de
 * donnees de depart.
 *
 * Son interet : n'importe qui recuperant le projet obtient une base
 * utilisable en une commande, sans avoir a saisir quoi que ce soit a la main.
 * C'est aussi ce qui permet de repartir d'un etat propre apres une erreur.
 *
 * Le script est ecrit pour pouvoir etre relance sans danger (voir upsert).
 */

const adaptateur = new PrismaPg({ connectionString: process.env['DATABASE_URL'] });
const prisma = new PrismaClient({ adapter: adaptateur });

const competitions = [
  {
    id: 'lol',
    nom: 'League of Legends',
    organisateur: 'Riot Games',
    univers: 'esport' as const,
    discipline: 'lol' as const,
    description:
      "Jeu d'arène de bataille en ligne à cinq contre cinq. Les données proviendront de l'API officielle de Riot Games.",
  },
  {
    id: 'valorant',
    nom: 'Valorant',
    organisateur: 'Riot Games',
    univers: 'esport' as const,
    discipline: 'valorant' as const,
    description:
      "Jeu de tir tactique à cinq contre cinq. Les données proviendront également de l'API officielle de Riot Games.",
  },
  {
    id: 'ligue1',
    nom: 'Ligue 1',
    organisateur: 'Championnat de France',
    univers: 'football' as const,
    discipline: 'football' as const,
    description:
      "Première division du football français. Les données proviendront de l'API football-data.org.",
  },
  {
    id: 'ldc',
    nom: 'Ligue des Champions',
    organisateur: 'Compétition européenne',
    univers: 'football' as const,
    discipline: 'football' as const,
    description:
      'Compétition annuelle entre les meilleurs clubs européens. Les données proviendront également de football-data.org.',
  },
];

const equipes = [
  { id: 'kc', nom: 'Karmine Corp', trigramme: 'KC' },
  { id: 'g2', nom: 'G2 Esports', trigramme: 'G2' },
  { id: 'fnc', nom: 'Fnatic', trigramme: 'FNC' },
  { id: 'vit', nom: 'Team Vitality', trigramme: 'VIT' },
  { id: 'th', nom: 'Team Heretics', trigramme: 'TH' },
  { id: 'tl', nom: 'Team Liquid', trigramme: 'TL' },
  { id: 'psg', nom: 'Paris Saint-Germain', trigramme: 'PSG' },
  { id: 'om', nom: 'Olympique de Marseille', trigramme: 'OM' },
  { id: 'asm', nom: 'AS Monaco', trigramme: 'ASM' },
  { id: 'ol', nom: 'Olympique Lyonnais', trigramme: 'OL' },
  { id: 'rma', nom: 'Real Madrid', trigramme: 'RMA' },
  { id: 'mci', nom: 'Manchester City', trigramme: 'MCI' },
  { id: 'fcb', nom: 'Bayern Munich', trigramme: 'FCB' },
  { id: 'int', nom: 'Inter Milan', trigramme: 'INT' },
];

/*
 * Les dates sont en UTC -- c'est ce que signifie le « Z » final.
 * Un match a 18h00 a Paris en septembre (UTC+2) s'ecrit 16:00:00.000Z.
 *
 * Etape 10 : « scoreCalcule » vaut true pour les matchs dont le detail est
 * rempli plus bas. Leur score est alors celui que donnent les buts ou les
 * manches gagnees -- le script le recalcule d'ailleurs a la fin pour s'en
 * assurer (voir verifierScores).
 */
const matchs = [
  {
    id: 'm1',
    competitionId: 'lol',
    domicileId: 'kc',
    exterieurId: 'g2',
    scoreDomicile: 1,
    scoreExterieur: 0,
    date: new Date('2026-09-14T15:00:00.000Z'),
    statut: 'en_direct' as const,
    scoreCalcule: true,
  },
  {
    id: 'm2',
    competitionId: 'ligue1',
    domicileId: 'psg',
    exterieurId: 'om',
    scoreDomicile: 2,
    scoreExterieur: 1,
    date: new Date('2026-09-14T15:45:00.000Z'),
    statut: 'en_direct' as const,
    scoreCalcule: true,
  },
  {
    id: 'm3',
    competitionId: 'lol',
    domicileId: 'fnc',
    exterieurId: 'vit',
    scoreDomicile: null,
    scoreExterieur: null,
    date: new Date('2026-09-15T16:00:00.000Z'),
    statut: 'a_venir' as const,
    scoreCalcule: false,
  },
  {
    id: 'm4',
    competitionId: 'valorant',
    domicileId: 'th',
    exterieurId: 'kc',
    scoreDomicile: null,
    scoreExterieur: null,
    date: new Date('2026-09-15T18:00:00.000Z'),
    statut: 'a_venir' as const,
    scoreCalcule: false,
  },
  {
    id: 'm5',
    competitionId: 'ldc',
    domicileId: 'rma',
    exterieurId: 'mci',
    scoreDomicile: null,
    scoreExterieur: null,
    date: new Date('2026-09-16T19:00:00.000Z'),
    statut: 'a_venir' as const,
    scoreCalcule: false,
  },
  {
    id: 'm6',
    competitionId: 'ligue1',
    domicileId: 'asm',
    exterieurId: 'ol',
    scoreDomicile: 3,
    scoreExterieur: 1,
    date: new Date('2026-09-13T19:00:00.000Z'),
    statut: 'termine' as const,
    scoreCalcule: true,
  },
  {
    id: 'm7',
    competitionId: 'valorant',
    domicileId: 'fnc',
    exterieurId: 'tl',
    scoreDomicile: 2,
    scoreExterieur: 0,
    date: new Date('2026-09-12T17:00:00.000Z'),
    statut: 'termine' as const,
    scoreCalcule: true,
  },
  {
    id: 'm8',
    competitionId: 'ldc',
    domicileId: 'fcb',
    exterieurId: 'int',
    scoreDomicile: 1,
    scoreExterieur: 1,
    date: new Date('2026-09-10T19:00:00.000Z'),
    statut: 'termine' as const,
    scoreCalcule: true,
  },
  // Etape 10 : un match de Valorant en direct, pour montrer une carte en cours.
  {
    id: 'm9',
    competitionId: 'valorant',
    domicileId: 'g2',
    exterieurId: 'fnc',
    scoreDomicile: 1,
    scoreExterieur: 0,
    date: new Date('2026-09-14T17:00:00.000Z'),
    statut: 'en_direct' as const,
    scoreCalcule: true,
  },
];

/*
 * ---------------------------------------------------------------------------
 * Etape 10 : les joueurs
 * ---------------------------------------------------------------------------
 *
 * Les joueurs sont FICTIFS. Les vrais effectifs changent a chaque saison :
 * ils arriveront avec les API externes (etapes 11 et 12). En attendant, ces
 * donnees de demonstration n'attribuent aucune performance a une personne
 * reelle.
 *
 * Les identifiants sont lisibles (« kc-vesper ») plutot que des UUID : on les
 * tape a la main dans Thunder Client pour tester l'ecriture du detail.
 */
const joueurs = [
  // League of Legends
  { id: 'kc-tarka', nom: 'Tarka', discipline: 'lol' as const, equipeId: 'kc' },
  { id: 'kc-nox', nom: 'Nox', discipline: 'lol' as const, equipeId: 'kc' },
  { id: 'kc-vesper', nom: 'Vesper', discipline: 'lol' as const, equipeId: 'kc' },
  { id: 'kc-kaelan', nom: 'Kaelan', discipline: 'lol' as const, equipeId: 'kc' },
  { id: 'kc-mirr', nom: 'Mirr', discipline: 'lol' as const, equipeId: 'kc' },
  { id: 'g2-brisk', nom: 'Brisk', discipline: 'lol' as const, equipeId: 'g2' },
  { id: 'g2-oakley', nom: 'Oakley', discipline: 'lol' as const, equipeId: 'g2' },
  { id: 'g2-zephyr', nom: 'Zephyr', discipline: 'lol' as const, equipeId: 'g2' },
  { id: 'g2-lumen', nom: 'Lumen', discipline: 'lol' as const, equipeId: 'g2' },
  { id: 'g2-tidal', nom: 'Tidal', discipline: 'lol' as const, equipeId: 'g2' },

  // Valorant -- G2 et Fnatic alignent aussi une equipe dans ce jeu.
  { id: 'fnc-ardent', nom: 'Ardent', discipline: 'valorant' as const, equipeId: 'fnc' },
  { id: 'fnc-kiro', nom: 'Kiro', discipline: 'valorant' as const, equipeId: 'fnc' },
  { id: 'fnc-sable', nom: 'Sable', discipline: 'valorant' as const, equipeId: 'fnc' },
  { id: 'fnc-volt', nom: 'Volt', discipline: 'valorant' as const, equipeId: 'fnc' },
  { id: 'fnc-wisp', nom: 'Wisp', discipline: 'valorant' as const, equipeId: 'fnc' },
  { id: 'tl-echo', nom: 'Echo', discipline: 'valorant' as const, equipeId: 'tl' },
  { id: 'tl-frost', nom: 'Frost', discipline: 'valorant' as const, equipeId: 'tl' },
  { id: 'tl-haze', nom: 'Haze', discipline: 'valorant' as const, equipeId: 'tl' },
  { id: 'tl-nyx', nom: 'Nyx', discipline: 'valorant' as const, equipeId: 'tl' },
  { id: 'tl-rune', nom: 'Rune', discipline: 'valorant' as const, equipeId: 'tl' },
  { id: 'g2-blaze', nom: 'Blaze', discipline: 'valorant' as const, equipeId: 'g2' },
  { id: 'g2-crux', nom: 'Crux', discipline: 'valorant' as const, equipeId: 'g2' },
  { id: 'g2-drift', nom: 'Drift', discipline: 'valorant' as const, equipeId: 'g2' },
  { id: 'g2-onyx', nom: 'Onyx', discipline: 'valorant' as const, equipeId: 'g2' },
  { id: 'g2-pulse', nom: 'Pulse', discipline: 'valorant' as const, equipeId: 'g2' },

  // Football : seulement les buteurs des matchs de demonstration.
  { id: 'psg-marchand', nom: 'L. Marchand', discipline: 'football' as const, equipeId: 'psg' },
  { id: 'om-bernard', nom: 'T. Bernard', discipline: 'football' as const, equipeId: 'om' },
  { id: 'asm-mendy', nom: 'K. Mendy', discipline: 'football' as const, equipeId: 'asm' },
  { id: 'ol-faure', nom: 'M. Faure', discipline: 'football' as const, equipeId: 'ol' },
  { id: 'ol-rousseau', nom: 'J. Rousseau', discipline: 'football' as const, equipeId: 'ol' },
  { id: 'fcb-wagner', nom: 'F. Wagner', discipline: 'football' as const, equipeId: 'fcb' },
  { id: 'int-moretti', nom: 'L. Moretti', discipline: 'football' as const, equipeId: 'int' },
];

/*
 * ---------------------------------------------------------------------------
 * Etape 10 : le detail des matchs
 * ---------------------------------------------------------------------------
 *
 * Les chiffres sont inventes, mais COHERENTS entre eux : les tirs cadres
 * d'une equipe valent ses buts plus les arrets du gardien adverse, les kills
 * d'une equipe les morts de l'autre, etc.
 */

type Cote = 'domicile' | 'exterieur';

/** Les onze statistiques d'une equipe de football, dans l'ordre du schema. */
function football(
  possession: number,
  tirs: number,
  tirsCadres: number,
  corners: number,
  fautes: number,
  horsJeu: number,
  cartonsJaunes: number,
  cartonsRouges: number,
  passes: number,
  passesReussies: number,
  arrets: number,
) {
  return {
    possession,
    tirs,
    tirsCadres,
    corners,
    fautes,
    horsJeu,
    cartonsJaunes,
    cartonsRouges,
    passes,
    passesReussies,
    arrets,
  };
}

const feuillesFootball = [
  {
    matchId: 'm2',
    domicile: football(58, 11, 5, 6, 7, 2, 1, 0, 402, 356, 1),
    exterieur: football(42, 6, 2, 2, 10, 1, 3, 0, 291, 238, 3),
    buts: [
      { cote: 'domicile' as Cote, buteurId: 'psg-marchand', minute: 12, tempsAdditionnel: null, type: 'normal' as const },
      { cote: 'exterieur' as Cote, buteurId: 'om-bernard', minute: 38, tempsAdditionnel: null, type: 'normal' as const },
      { cote: 'domicile' as Cote, buteurId: 'psg-marchand', minute: 45, tempsAdditionnel: 2, type: 'penalty' as const },
    ],
  },
  {
    matchId: 'm6',
    domicile: football(47, 14, 6, 5, 11, 3, 2, 0, 438, 371, 4),
    exterieur: football(53, 13, 5, 7, 9, 1, 1, 1, 489, 420, 4),
    buts: [
      { cote: 'domicile' as Cote, buteurId: 'asm-mendy', minute: 9, tempsAdditionnel: null, type: 'normal' as const },
      { cote: 'exterieur' as Cote, buteurId: 'ol-faure', minute: 27, tempsAdditionnel: null, type: 'normal' as const },
      // Contre son camp : un joueur lyonnais marque... pour Monaco.
      { cote: 'domicile' as Cote, buteurId: 'ol-rousseau', minute: 54, tempsAdditionnel: null, type: 'csc' as const },
      { cote: 'domicile' as Cote, buteurId: 'asm-mendy', minute: 81, tempsAdditionnel: null, type: 'normal' as const },
    ],
  },
  {
    matchId: 'm8',
    domicile: football(61, 17, 6, 8, 8, 2, 1, 0, 612, 548, 2),
    exterieur: football(39, 7, 3, 3, 13, 3, 4, 0, 377, 305, 5),
    buts: [
      { cote: 'domicile' as Cote, buteurId: 'fcb-wagner', minute: 33, tempsAdditionnel: null, type: 'normal' as const },
      { cote: 'exterieur' as Cote, buteurId: 'int-moretti', minute: 90, tempsAdditionnel: 4, type: 'normal' as const },
    ],
  },
];

/** Une ligne de joueur de League of Legends. */
function lol(
  joueurId: string,
  poste: 'top' | 'jungle' | 'mid' | 'adc' | 'support',
  champion: string,
  kills: number,
  morts: number,
  assistances: number,
  sbires: number,
  gold: number,
  niveau: number,
  objets: string[],
) {
  return { joueurId, poste, champion, kills, morts, assistances, sbires, gold, niveau, objets };
}

/*
 * Les noms d'objets sont en anglais : ce sont ceux qu'emploient l'API de Riot
 * et la scene competitive, y compris francophone.
 */
const partiesLol = [
  {
    matchId: 'm1',
    numero: 1,
    duree: 1985,
    coteBleu: 'domicile' as Cote,
    vainqueur: 'domicile' as Cote | null,
    equipes: {
      domicile: { tours: 9, inhibiteurs: 2, barons: 1, herauts: 1, larves: 4 },
      exterieur: { tours: 3, inhibiteurs: 0, barons: 0, herauts: 0, larves: 2 },
    },
    joueurs: {
      domicile: [
        lol('kc-tarka', 'top', 'Rumble', 3, 2, 7, 268, 13450, 17, ["Liandry's Torment", 'Stormsurge', "Sorcerer's Shoes", 'Oracle Lens']),
        lol('kc-nox', 'jungle', 'Vi', 4, 1, 11, 187, 12100, 16, ['Black Cleaver', "Sterak's Gage", 'Plated Steelcaps', 'Oracle Lens']),
        lol('kc-vesper', 'mid', 'Orianna', 6, 1, 9, 301, 14820, 18, ["Luden's Companion", "Rabadon's Deathcap", "Zhonya's Hourglass", "Sorcerer's Shoes", 'Farsight Alteration']),
        lol('kc-kaelan', 'adc', 'Jinx', 9, 2, 6, 342, 16990, 17, ['Kraken Slayer', 'Infinity Edge', 'Rapid Firecannon', "Berserker's Greaves", 'Farsight Alteration']),
        lol('kc-mirr', 'support', 'Rell', 0, 3, 17, 38, 8350, 14, ['Celestial Opposition', 'Locket of the Iron Solari', 'Plated Steelcaps', 'Oracle Lens']),
      ],
      exterieur: [
        lol('g2-brisk', 'top', 'Gnar', 2, 4, 3, 241, 11020, 16, ['Black Cleaver', "Sterak's Gage", "Mercury's Treads", 'Oracle Lens']),
        lol('g2-oakley', 'jungle', 'Sejuani', 1, 5, 5, 162, 9480, 15, ['Sunfire Aegis', 'Thornmail', 'Plated Steelcaps', 'Oracle Lens']),
        lol('g2-zephyr', 'mid', 'Azir', 3, 4, 2, 288, 12160, 16, ["Nashor's Tooth", "Rabadon's Deathcap", "Sorcerer's Shoes", 'Farsight Alteration']),
        lol('g2-lumen', 'adc', 'Kalista', 3, 5, 2, 305, 11890, 15, ['Blade of the Ruined King', 'Guinsoo\'s Rageblade', "Berserker's Greaves", 'Farsight Alteration']),
        lol('g2-tidal', 'support', 'Nautilus', 0, 4, 6, 31, 7010, 13, ['Bloodsong', "Knight's Vow", "Mercury's Treads", 'Oracle Lens']),
      ],
    },
    // Le troisieme dragon (Montagne) a fixe le type de tous les suivants ; le
    // quatrieme dragon de Karmine Corp lui a donne l'ame de la Montagne.
    dragons: [
      { cote: 'domicile' as Cote, type: 'ocean' as const },
      { cote: 'exterieur' as Cote, type: 'infernal' as const },
      { cote: 'domicile' as Cote, type: 'montagne' as const },
      { cote: 'domicile' as Cote, type: 'montagne' as const },
      { cote: 'domicile' as Cote, type: 'montagne' as const },
    ],
  },
  {
    matchId: 'm1',
    numero: 2,
    duree: 1122,
    coteBleu: 'exterieur' as Cote,
    // Partie en cours : pas encore de vainqueur.
    vainqueur: null as Cote | null,
    equipes: {
      domicile: { tours: 2, inhibiteurs: 0, barons: 0, herauts: 1, larves: 3 },
      exterieur: { tours: 4, inhibiteurs: 0, barons: 0, herauts: 0, larves: 3 },
    },
    joueurs: {
      domicile: [
        lol('kc-tarka', 'top', "K'Sante", 1, 2, 2, 151, 6510, 12, ['Sunfire Aegis', 'Plated Steelcaps', 'Stealth Ward']),
        lol('kc-nox', 'jungle', 'Lee Sin', 2, 2, 3, 98, 6240, 11, ['Eclipse', 'Plated Steelcaps', 'Oracle Lens']),
        lol('kc-vesper', 'mid', 'Ahri', 2, 1, 2, 176, 7380, 13, ["Luden's Companion", "Sorcerer's Shoes", 'Stealth Ward']),
        lol('kc-kaelan', 'adc', 'Varus', 1, 2, 3, 182, 7020, 11, ['Kraken Slayer', "Berserker's Greaves", 'Farsight Alteration']),
        lol('kc-mirr', 'support', 'Alistar', 0, 2, 4, 21, 4120, 10, ['Celestial Opposition', 'Boots', 'Oracle Lens']),
      ],
      exterieur: [
        lol('g2-brisk', 'top', 'Renekton', 2, 1, 3, 160, 7110, 12, ['Eclipse', 'Plated Steelcaps', 'Stealth Ward']),
        lol('g2-oakley', 'jungle', 'Xin Zhao', 3, 1, 4, 102, 6890, 12, ['Trinity Force', 'Plated Steelcaps', 'Oracle Lens']),
        lol('g2-zephyr', 'mid', 'Syndra', 2, 2, 5, 170, 7240, 13, ["Luden's Companion", "Sorcerer's Shoes", 'Stealth Ward']),
        lol('g2-lumen', 'adc', 'Ezreal', 2, 1, 4, 176, 7300, 11, ["Muramana", 'Trinity Force', 'Ionian Boots of Lucidity', 'Farsight Alteration']),
        lol('g2-tidal', 'support', 'Rakan', 0, 1, 7, 18, 4470, 10, ['Bloodsong', 'Ionian Boots of Lucidity', 'Oracle Lens']),
      ],
    },
    dragons: [
      { cote: 'exterieur' as Cote, type: 'hextech' as const },
      { cote: 'domicile' as Cote, type: 'nuage' as const },
    ],
  },
];

/** Une ligne de joueur de Valorant. */
function val(
  joueurId: string,
  agent: string,
  kills: number,
  morts: number,
  assistances: number,
  acs: number,
  adr: number,
  tirsTete: number,
  premiersKills: number,
  premieresMorts: number,
) {
  return { joueurId, agent, kills, morts, assistances, acs, adr, tirsTete, premiersKills, premieresMorts };
}

const cartesValorant = [
  {
    matchId: 'm7',
    numero: 1,
    nom: 'Ascent',
    vainqueur: 'domicile' as Cote | null,
    // 13 - 9 : Fnatic a gagne 7 rounds en attaque et 6 en defense.
    equipes: {
      domicile: { roundsAttaque: 7, roundsDefense: 6 },
      exterieur: { roundsAttaque: 4, roundsDefense: 5 },
    },
    joueurs: {
      domicile: [
        val('fnc-ardent', 'Jett', 22, 13, 4, 281, 176, 27, 6, 2),
        val('fnc-volt', 'Raze', 18, 16, 3, 243, 158, 21, 4, 2),
        val('fnc-kiro', 'Omen', 15, 14, 8, 212, 139, 24, 2, 1),
        val('fnc-sable', 'Sova', 14, 15, 9, 198, 131, 22, 1, 2),
        val('fnc-wisp', 'Killjoy', 12, 14, 5, 174, 117, 29, 1, 1),
      ],
      exterieur: [
        val('tl-echo', 'Jett', 19, 17, 3, 247, 162, 25, 4, 4),
        val('tl-nyx', 'Raze', 16, 17, 2, 219, 146, 19, 2, 4),
        val('tl-frost', 'Omen', 13, 16, 7, 186, 124, 20, 1, 3),
        val('tl-haze', 'Sova', 12, 16, 8, 171, 113, 23, 1, 2),
        val('tl-rune', 'Killjoy', 12, 15, 4, 163, 108, 26, 0, 1),
      ],
    },
  },
  {
    matchId: 'm7',
    numero: 2,
    nom: 'Lotus',
    vainqueur: 'domicile' as Cote | null,
    equipes: {
      domicile: { roundsAttaque: 6, roundsDefense: 7 },
      exterieur: { roundsAttaque: 5, roundsDefense: 6 },
    },
    joueurs: {
      domicile: [
        val('fnc-ardent', 'Raze', 24, 17, 5, 268, 169, 23, 5, 3),
        val('fnc-volt', 'Neon', 19, 18, 4, 236, 151, 20, 4, 2),
        val('fnc-kiro', 'Omen', 16, 16, 9, 201, 133, 26, 2, 2),
        val('fnc-sable', 'Fade', 15, 17, 11, 192, 128, 21, 2, 2),
        val('fnc-wisp', 'Killjoy', 14, 15, 6, 181, 119, 28, 1, 1),
      ],
      exterieur: [
        val('tl-echo', 'Raze', 21, 18, 4, 251, 160, 24, 4, 4),
        val('tl-nyx', 'Neon', 19, 18, 3, 229, 149, 18, 3, 4),
        val('tl-frost', 'Omen', 15, 17, 8, 190, 126, 22, 2, 3),
        val('tl-haze', 'Fade', 14, 18, 10, 178, 118, 21, 1, 2),
        val('tl-rune', 'Killjoy', 14, 17, 5, 170, 112, 27, 0, 1),
      ],
    },
  },
  {
    matchId: 'm9',
    numero: 1,
    nom: 'Haven',
    vainqueur: 'domicile' as Cote | null,
    equipes: {
      domicile: { roundsAttaque: 8, roundsDefense: 5 },
      exterieur: { roundsAttaque: 6, roundsDefense: 4 },
    },
    joueurs: {
      domicile: [
        val('g2-blaze', 'Jett', 23, 14, 3, 289, 181, 26, 6, 3),
        val('g2-drift', 'Omen', 16, 15, 7, 209, 138, 24, 2, 2),
        val('g2-pulse', 'Sova', 15, 16, 8, 196, 129, 22, 2, 3),
        val('g2-crux', 'Breach', 14, 15, 12, 188, 127, 19, 1, 2),
        val('g2-onyx', 'Cypher', 13, 14, 4, 172, 115, 30, 1, 1),
      ],
      exterieur: [
        val('fnc-ardent', 'Jett', 20, 17, 2, 254, 164, 25, 5, 4),
        val('fnc-volt', 'Raze', 16, 16, 3, 214, 141, 19, 3, 2),
        val('fnc-sable', 'Sova', 14, 16, 9, 185, 124, 21, 1, 2),
        val('fnc-kiro', 'Omen', 13, 16, 8, 178, 121, 23, 2, 3),
        val('fnc-wisp', 'Killjoy', 11, 16, 5, 159, 106, 28, 0, 1),
      ],
    },
  },
  {
    matchId: 'm9',
    numero: 2,
    nom: 'Sunset',
    // Carte en cours, 7 - 5 a la mi-temps : G2 a defendu en premiere periode.
    vainqueur: null as Cote | null,
    equipes: {
      domicile: { roundsAttaque: 0, roundsDefense: 7 },
      exterieur: { roundsAttaque: 5, roundsDefense: 0 },
    },
    joueurs: {
      domicile: [
        val('g2-blaze', 'Raze', 11, 7, 1, 263, 170, 24, 3, 2),
        val('g2-drift', 'Omen', 7, 7, 4, 198, 131, 23, 1, 1),
        val('g2-crux', 'Breach', 6, 8, 6, 175, 118, 18, 1, 1),
        val('g2-pulse', 'Fade', 6, 8, 5, 170, 114, 21, 1, 1),
        val('g2-onyx', 'Cypher', 5, 7, 2, 151, 102, 31, 0, 1),
      ],
      exterieur: [
        val('fnc-ardent', 'Raze', 10, 7, 2, 251, 163, 22, 3, 2),
        val('fnc-volt', 'Neon', 8, 8, 2, 207, 139, 18, 1, 1),
        val('fnc-kiro', 'Omen', 7, 7, 4, 189, 125, 25, 1, 1),
        val('fnc-sable', 'Fade', 6, 7, 5, 168, 112, 20, 1, 1),
        val('fnc-wisp', 'Killjoy', 6, 6, 3, 160, 104, 27, 0, 1),
      ],
    },
  },
];

/** Ajoute le cote a chaque joueur : { domicile: [...], exterieur: [...] } -> une seule liste. */
function avecCote<T>(parCote: Record<Cote, T[]>) {
  return [
    ...parCote.domicile.map((ligne) => ({ ...ligne, cote: 'domicile' as Cote })),
    ...parCote.exterieur.map((ligne) => ({ ...ligne, cote: 'exterieur' as Cote })),
  ];
}

async function peupler(): Promise<void> {
  console.log('Peuplement de la base…');

  /*
   * L'ORDRE COMPTE. Un match reference une competition et deux equipes :
   * PostgreSQL refuse de creer une ligne dont la cle etrangere pointe vers
   * une ligne inexistante. Il faut donc creer les references AVANT ce qui
   * s'y rattache.
   */
  for (const competition of competitions) {
    /*
     * upsert = « mets a jour si ca existe, cree sinon ».
     *
     * C'est ce qui rend le script relancable sans danger : avec un simple
     * create, une seconde execution echouerait sur un identifiant deja pris.
     */
    await prisma.competition.upsert({
      where: { id: competition.id },
      update: competition,
      create: competition,
    });
  }
  console.log(`  ${competitions.length} compétitions`);

  for (const equipe of equipes) {
    await prisma.equipe.upsert({
      where: { id: equipe.id },
      update: equipe,
      create: equipe,
    });
  }
  console.log(`  ${equipes.length} équipes`);

  for (const match of matchs) {
    await prisma.match.upsert({
      where: { id: match.id },
      update: match,
      create: match,
    });
  }
  console.log(`  ${matchs.length} matchs`);

  // Etape 10 : les joueurs, AVANT les statistiques qui les referencent.
  for (const joueur of joueurs) {
    await prisma.joueur.upsert({
      where: { id: joueur.id },
      update: joueur,
      create: joueur,
    });
  }
  console.log(`  ${joueurs.length} joueurs`);

  /*
   * Etape 10 : le detail des matchs.
   *
   * Ici, pas d'upsert : le detail d'un match est d'abord SUPPRIME, puis
   * recree. Grace au ON DELETE CASCADE, supprimer une partie supprime aussi
   * ses statistiques et ses dragons. Le script reste relancable sans danger.
   */
  for (const feuille of feuillesFootball) {
    await prisma.statistiquesFootball.deleteMany({ where: { matchId: feuille.matchId } });
    await prisma.but.deleteMany({ where: { matchId: feuille.matchId } });

    await prisma.statistiquesFootball.createMany({
      data: [
        { matchId: feuille.matchId, cote: 'domicile', ...feuille.domicile },
        { matchId: feuille.matchId, cote: 'exterieur', ...feuille.exterieur },
      ],
    });
    await prisma.but.createMany({
      data: feuille.buts.map((but) => ({ matchId: feuille.matchId, ...but })),
    });
  }
  console.log(`  ${feuillesFootball.length} feuilles de match de football`);

  for (const matchId of new Set(partiesLol.map((partie) => partie.matchId))) {
    await prisma.partieLol.deleteMany({ where: { matchId } });
  }
  for (const partie of partiesLol) {
    // Ecriture IMBRIQUEE : la partie et tout ce qui s'y rattache, d'un coup.
    await prisma.partieLol.create({
      data: {
        matchId: partie.matchId,
        numero: partie.numero,
        duree: partie.duree,
        coteBleu: partie.coteBleu,
        vainqueur: partie.vainqueur,
        equipes: {
          create: [
            { cote: 'domicile', ...partie.equipes.domicile },
            { cote: 'exterieur', ...partie.equipes.exterieur },
          ],
        },
        joueurs: { create: avecCote(partie.joueurs) },
        dragons: { create: partie.dragons.map((dragon, index) => ({ ordre: index + 1, ...dragon })) },
      },
    });
  }
  console.log(`  ${partiesLol.length} parties de League of Legends`);

  for (const matchId of new Set(cartesValorant.map((carte) => carte.matchId))) {
    await prisma.carteValorant.deleteMany({ where: { matchId } });
  }
  for (const carte of cartesValorant) {
    await prisma.carteValorant.create({
      data: {
        matchId: carte.matchId,
        numero: carte.numero,
        nom: carte.nom,
        vainqueur: carte.vainqueur,
        equipes: {
          create: [
            { cote: 'domicile', ...carte.equipes.domicile },
            { cote: 'exterieur', ...carte.equipes.exterieur },
          ],
        },
        joueurs: { create: avecCote(carte.joueurs) },
      },
    });
  }
  console.log(`  ${cartesValorant.length} cartes de Valorant`);

  await verifierScores();

  console.log('Terminé.');
}

/**
 * Etape 10 : un filet de securite pour les donnees ci-dessus.
 *
 * Le score d'un match detaille est ecrit a la main dans « matchs », mais il
 * doit correspondre aux buts ou aux manches gagnees. Ce script ne passe pas
 * par l'API, qui le recalcule toute seule : il verifie donc lui-meme, et
 * s'arrete au moindre ecart plutot que de laisser une base incoherente.
 */
async function verifierScores(): Promise<void> {
  const detailles = await prisma.match.findMany({
    where: { scoreCalcule: true },
    select: { id: true, scoreDomicile: true, scoreExterieur: true, competition: { select: { discipline: true } } },
  });

  for (const match of detailles) {
    const compter = (cote: Cote): Promise<number> => {
      switch (match.competition.discipline) {
        case 'football':
          return prisma.but.count({ where: { matchId: match.id, cote } });
        case 'lol':
          return prisma.partieLol.count({ where: { matchId: match.id, vainqueur: cote } });
        case 'valorant':
          return prisma.carteValorant.count({ where: { matchId: match.id, vainqueur: cote } });
      }
    };

    const domicile = await compter('domicile');
    const exterieur = await compter('exterieur');
    if (domicile !== match.scoreDomicile || exterieur !== match.scoreExterieur) {
      throw new Error(
        `Match ${match.id} : score ${match.scoreDomicile}-${match.scoreExterieur} en base, ${domicile}-${exterieur} d'après le détail.`,
      );
    }
  }
  console.log(`  ${detailles.length} scores vérifiés`);
}

peupler()
  .catch((erreur) => {
    console.error('Le peuplement a échoué :', erreur);
    // Code de sortie different de zero : signale l'echec aux outils
    // qui lancent ce script (npm, integration continue).
    process.exit(1);
  })
  .finally(() => {
    // Ferme proprement les connexions, sinon le script resterait suspendu.
    void prisma.$disconnect();
  });
