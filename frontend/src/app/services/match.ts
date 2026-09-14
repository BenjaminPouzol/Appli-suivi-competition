import { Service } from '@angular/core';
import { Equipe } from '../modeles/equipe';
import { Match, StatutMatch } from '../modeles/match';

/* Les equipes sont declarees a part puis reutilisees dans les matchs :
   ecrire « Karmine Corp » une seule fois evite qu'une faute de frappe cree
   deux equipes differentes aux yeux du programme. */
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

/**
 * Fournit le calendrier des rencontres.
 *
 * Comme pour les competitions, les donnees sont simulees. Elles sont
 * volontairement variees -- matchs en cours, a venir et termines -- pour que
 * l'interface ait a gerer les trois cas des maintenant.
 */
@Service()
export class MatchService {
  private readonly matchs: Match[] = [
    {
      id: 'm1',
      competitionId: 'lol',
      domicile: KC,
      exterieur: G2,
      scoreDomicile: 1,
      scoreExterieur: 0,
      date: new Date('2026-09-14T17:00:00'),
      statut: 'en-direct',
    },
    {
      id: 'm2',
      competitionId: 'ligue1',
      domicile: PSG,
      exterieur: OM,
      scoreDomicile: 2,
      scoreExterieur: 1,
      date: new Date('2026-09-14T17:45:00'),
      statut: 'en-direct',
    },
    {
      id: 'm3',
      competitionId: 'lol',
      domicile: FNC,
      exterieur: VIT,
      scoreDomicile: null,
      scoreExterieur: null,
      date: new Date('2026-09-15T18:00:00'),
      statut: 'a-venir',
    },
    {
      id: 'm4',
      competitionId: 'valorant',
      domicile: TH,
      exterieur: KC,
      scoreDomicile: null,
      scoreExterieur: null,
      date: new Date('2026-09-15T20:00:00'),
      statut: 'a-venir',
    },
    {
      id: 'm5',
      competitionId: 'ldc',
      domicile: RMA,
      exterieur: MCI,
      scoreDomicile: null,
      scoreExterieur: null,
      date: new Date('2026-09-16T21:00:00'),
      statut: 'a-venir',
    },
    {
      id: 'm6',
      competitionId: 'ligue1',
      domicile: ASM,
      exterieur: OL,
      scoreDomicile: 3,
      scoreExterieur: 1,
      date: new Date('2026-09-13T21:00:00'),
      statut: 'termine',
    },
    {
      id: 'm7',
      competitionId: 'valorant',
      domicile: FNC,
      exterieur: TL,
      scoreDomicile: 2,
      scoreExterieur: 0,
      date: new Date('2026-09-12T19:00:00'),
      statut: 'termine',
    },
    {
      id: 'm8',
      competitionId: 'ldc',
      domicile: FCB,
      exterieur: INT,
      scoreDomicile: 1,
      scoreExterieur: 1,
      date: new Date('2026-09-10T21:00:00'),
      statut: 'termine',
    },
  ];

  /** Tous les matchs connus. */
  listerTous(): Match[] {
    return this.matchs;
  }

  /** Les matchs dans un etat donne, ranges par ordre chronologique. */
  listerParStatut(statut: StatutMatch): Match[] {
    return this.matchs
      .filter((match) => match.statut === statut)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }
}
