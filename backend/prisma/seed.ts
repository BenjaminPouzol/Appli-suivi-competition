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
    description:
      "Jeu d'arène de bataille en ligne à cinq contre cinq. Les données proviendront de l'API officielle de Riot Games.",
  },
  {
    id: 'valorant',
    nom: 'Valorant',
    organisateur: 'Riot Games',
    univers: 'esport' as const,
    description:
      "Jeu de tir tactique à cinq contre cinq. Les données proviendront également de l'API officielle de Riot Games.",
  },
  {
    id: 'ligue1',
    nom: 'Ligue 1',
    organisateur: 'Championnat de France',
    univers: 'football' as const,
    description:
      "Première division du football français. Les données proviendront de l'API football-data.org.",
  },
  {
    id: 'ldc',
    nom: 'Ligue des Champions',
    organisateur: 'Compétition européenne',
    univers: 'football' as const,
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
  },
];

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

  console.log('Terminé.');
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
