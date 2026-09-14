import { Equipe } from '../modeles/equipe';
import { Match } from '../modeles/match';

/*
 * Les dates sont stockees en UTC -- c'est ce que signifie le « Z » final.
 *
 * Un instant n'a qu'une seule valeur universelle, mais s'affiche differemment
 * selon l'endroit ou on se trouve. Un match a 18h00 a Paris en septembre
 * (heure d'ete, UTC+2) s'ecrit donc 16:00:00.000Z.
 *
 * Stocker l'heure locale sans preciser le fuseau serait ambigu : impossible
 * de savoir de quelle heure locale il s'agit, et le meme match s'afficherait
 * a des heures differentes selon le pays du visiteur.
 */


const KC: Equipe = { id: 'kc', nom: 'Karmine Corp', trigramme: 'KC' };
const G2: Equipe = { id: 'g2', nom: 'G2 Esports', trigramme: 'G2' };
const FNC: Equipe = { id: 'fnc', nom: 'Fnatic', trigramme: 'FNC' };
const VIT: Equipe = { id: 'vit', nom: 'Team Vitality', trigramme: 'VIT' };
const TH: Equipe = { id: 'th', nom: 'Team Heretics', trigramme: 'TH' };
const TL: Equipe = { id: 'tl', nom: 'Team Liquid', trigramme: 'TL' };
const PSG: Equipe = { id: 'psg', nom: 'Paris Saint-Germain', trigramme: 'PSG' };
const OM: Equipe = { id: 'om', nom: 'Olympique de Marseille', trigramme: 'OM' };
const ASM: Equipe = { id: 'asm', nom: 'AS Monaco', trigramme: 'ASM' };
const OL: Equipe = { id: 'ol', nom: 'Olympique Lyonnais', trigramme: 'OL' };
const RMA: Equipe = { id: 'rma', nom: 'Real Madrid', trigramme: 'RMA' };
const MCI: Equipe = { id: 'mci', nom: 'Manchester City', trigramme: 'MCI' };
const FCB: Equipe = { id: 'fcb', nom: 'Bayern Munich', trigramme: 'FCB' };
const INT: Equipe = { id: 'int', nom: 'Inter Milan', trigramme: 'INT' };

export const matchs: Match[] = [
  {
    id: 'm1',
    competitionId: 'lol',
    domicile: KC,
    exterieur: G2,
    scoreDomicile: 1,
    scoreExterieur: 0,
    date: '2026-09-14T15:00:00.000Z',
    statut: 'en-direct',
  },
  {
    id: 'm2',
    competitionId: 'ligue1',
    domicile: PSG,
    exterieur: OM,
    scoreDomicile: 2,
    scoreExterieur: 1,
    date: '2026-09-14T15:45:00.000Z',
    statut: 'en-direct',
  },
  {
    id: 'm3',
    competitionId: 'lol',
    domicile: FNC,
    exterieur: VIT,
    scoreDomicile: null,
    scoreExterieur: null,
    date: '2026-09-15T16:00:00.000Z',
    statut: 'a-venir',
  },
  {
    id: 'm4',
    competitionId: 'valorant',
    domicile: TH,
    exterieur: KC,
    scoreDomicile: null,
    scoreExterieur: null,
    date: '2026-09-15T18:00:00.000Z',
    statut: 'a-venir',
  },
  {
    id: 'm5',
    competitionId: 'ldc',
    domicile: RMA,
    exterieur: MCI,
    scoreDomicile: null,
    scoreExterieur: null,
    date: '2026-09-16T19:00:00.000Z',
    statut: 'a-venir',
  },
  {
    id: 'm6',
    competitionId: 'ligue1',
    domicile: ASM,
    exterieur: OL,
    scoreDomicile: 3,
    scoreExterieur: 1,
    date: '2026-09-13T19:00:00.000Z',
    statut: 'termine',
  },
  {
    id: 'm7',
    competitionId: 'valorant',
    domicile: FNC,
    exterieur: TL,
    scoreDomicile: 2,
    scoreExterieur: 0,
    date: '2026-09-12T17:00:00.000Z',
    statut: 'termine',
  },
  {
    id: 'm8',
    competitionId: 'ldc',
    domicile: FCB,
    exterieur: INT,
    scoreDomicile: 1,
    scoreExterieur: 1,
    date: '2026-09-10T19:00:00.000Z',
    statut: 'termine',
  },
];
