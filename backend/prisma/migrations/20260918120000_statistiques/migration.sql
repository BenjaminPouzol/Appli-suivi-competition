-- Etape 10 : les statistiques detaillees des matchs.
--
-- Cette migration a ete generee avec « prisma migrate dev --create-only »,
-- puis completee a la main a deux endroits, signales par « A LA MAIN » :
--
--   1. la colonne competitions.discipline, obligatoire, ajoutee a une table
--      qui contient deja des lignes (voir plus bas) ;
--   2. les contraintes CHECK, a la fin, que le schema Prisma ne sait pas
--      exprimer (comme a l'etape 7).

-- CreateEnum
CREATE TYPE "Discipline" AS ENUM ('football', 'lol', 'valorant');

-- CreateEnum
CREATE TYPE "Cote" AS ENUM ('domicile', 'exterieur');

-- CreateEnum
CREATE TYPE "TypeBut" AS ENUM ('normal', 'penalty', 'csc');

-- CreateEnum
CREATE TYPE "PosteLol" AS ENUM ('top', 'jungle', 'mid', 'adc', 'support');

-- CreateEnum
CREATE TYPE "TypeDragon" AS ENUM ('infernal', 'ocean', 'montagne', 'nuage', 'hextech', 'chemtech', 'ancestral');

-- AlterTable -- A LA MAIN.
--
-- Prisma avait genere une seule ligne :
--   ALTER TABLE "competitions" ADD COLUMN "discipline" "Discipline" NOT NULL;
-- Elle echoue sur une table non vide : les quatre competitions existantes
-- n'auraient aucune valeur pour une colonne qui l'interdit. On procede donc
-- en trois temps : ajouter la colonne en l'autorisant vide, la remplir, puis
-- l'interdire vide. Le resultat final est exactement celui que decrit le
-- schema.
ALTER TABLE "competitions" ADD COLUMN "discipline" "Discipline";

UPDATE "competitions" SET "discipline" = 'football' WHERE "univers" = 'football';
UPDATE "competitions" SET "discipline" = 'valorant' WHERE "univers" = 'esport' AND "id" = 'valorant';
-- Toute autre competition esport existante est, a ce stade du projet, de
-- League of Legends.
UPDATE "competitions" SET "discipline" = 'lol' WHERE "discipline" IS NULL;

ALTER TABLE "competitions" ALTER COLUMN "discipline" SET NOT NULL;

-- AlterTable
ALTER TABLE "matchs" ADD COLUMN "score_calcule" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "joueurs" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "discipline" "Discipline" NOT NULL,
    "equipe_id" TEXT NOT NULL,

    CONSTRAINT "joueurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "statistiques_football" (
    "match_id" TEXT NOT NULL,
    "cote" "Cote" NOT NULL,
    "possession" INTEGER NOT NULL,
    "tirs" INTEGER NOT NULL,
    "tirs_cadres" INTEGER NOT NULL,
    "corners" INTEGER NOT NULL,
    "fautes" INTEGER NOT NULL,
    "hors_jeu" INTEGER NOT NULL,
    "cartons_jaunes" INTEGER NOT NULL,
    "cartons_rouges" INTEGER NOT NULL,
    "passes" INTEGER NOT NULL,
    "passes_reussies" INTEGER NOT NULL,
    "arrets" INTEGER NOT NULL,

    CONSTRAINT "statistiques_football_pkey" PRIMARY KEY ("match_id","cote")
);

-- CreateTable
CREATE TABLE "buts" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "cote" "Cote" NOT NULL,
    "buteur_id" TEXT NOT NULL,
    "minute" INTEGER NOT NULL,
    "temps_additionnel" INTEGER,
    "type" "TypeBut" NOT NULL,

    CONSTRAINT "buts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parties_lol" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "duree" INTEGER NOT NULL,
    "cote_bleu" "Cote" NOT NULL,
    "vainqueur" "Cote",

    CONSTRAINT "parties_lol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "statistiques_equipe_lol" (
    "partie_id" TEXT NOT NULL,
    "cote" "Cote" NOT NULL,
    "tours" INTEGER NOT NULL,
    "inhibiteurs" INTEGER NOT NULL,
    "barons" INTEGER NOT NULL,
    "herauts" INTEGER NOT NULL,
    "larves" INTEGER NOT NULL,

    CONSTRAINT "statistiques_equipe_lol_pkey" PRIMARY KEY ("partie_id","cote")
);

-- CreateTable
CREATE TABLE "statistiques_joueur_lol" (
    "partie_id" TEXT NOT NULL,
    "joueur_id" TEXT NOT NULL,
    "cote" "Cote" NOT NULL,
    "poste" "PosteLol" NOT NULL,
    "champion" TEXT NOT NULL,
    "kills" INTEGER NOT NULL,
    "morts" INTEGER NOT NULL,
    "assistances" INTEGER NOT NULL,
    "sbires" INTEGER NOT NULL,
    "gold" INTEGER NOT NULL,
    "niveau" INTEGER NOT NULL,
    "objets" TEXT[],

    CONSTRAINT "statistiques_joueur_lol_pkey" PRIMARY KEY ("partie_id","joueur_id")
);

-- CreateTable
CREATE TABLE "dragons_lol" (
    "partie_id" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL,
    "cote" "Cote" NOT NULL,
    "type" "TypeDragon" NOT NULL,

    CONSTRAINT "dragons_lol_pkey" PRIMARY KEY ("partie_id","ordre")
);

-- CreateTable
CREATE TABLE "cartes_valorant" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "nom" TEXT NOT NULL,
    "vainqueur" "Cote",

    CONSTRAINT "cartes_valorant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "statistiques_equipe_valorant" (
    "carte_id" TEXT NOT NULL,
    "cote" "Cote" NOT NULL,
    "rounds_attaque" INTEGER NOT NULL,
    "rounds_defense" INTEGER NOT NULL,

    CONSTRAINT "statistiques_equipe_valorant_pkey" PRIMARY KEY ("carte_id","cote")
);

-- CreateTable
CREATE TABLE "statistiques_joueur_valorant" (
    "carte_id" TEXT NOT NULL,
    "joueur_id" TEXT NOT NULL,
    "cote" "Cote" NOT NULL,
    "agent" TEXT NOT NULL,
    "kills" INTEGER NOT NULL,
    "morts" INTEGER NOT NULL,
    "assistances" INTEGER NOT NULL,
    "acs" INTEGER NOT NULL,
    "adr" INTEGER NOT NULL,
    "tirs_tete" INTEGER NOT NULL,
    "premiers_kills" INTEGER NOT NULL,
    "premieres_morts" INTEGER NOT NULL,

    CONSTRAINT "statistiques_joueur_valorant_pkey" PRIMARY KEY ("carte_id","joueur_id")
);

-- CreateIndex
CREATE INDEX "joueurs_equipe_id_idx" ON "joueurs"("equipe_id");

-- CreateIndex
CREATE INDEX "buts_match_id_idx" ON "buts"("match_id");

-- CreateIndex
CREATE UNIQUE INDEX "parties_lol_match_id_numero_key" ON "parties_lol"("match_id", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "statistiques_joueur_lol_partie_id_cote_poste_key" ON "statistiques_joueur_lol"("partie_id", "cote", "poste");

-- CreateIndex
CREATE UNIQUE INDEX "cartes_valorant_match_id_numero_key" ON "cartes_valorant"("match_id", "numero");

-- AddForeignKey
ALTER TABLE "joueurs" ADD CONSTRAINT "joueurs_equipe_id_fkey" FOREIGN KEY ("equipe_id") REFERENCES "equipes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statistiques_football" ADD CONSTRAINT "statistiques_football_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matchs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buts" ADD CONSTRAINT "buts_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matchs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buts" ADD CONSTRAINT "buts_buteur_id_fkey" FOREIGN KEY ("buteur_id") REFERENCES "joueurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parties_lol" ADD CONSTRAINT "parties_lol_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matchs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statistiques_equipe_lol" ADD CONSTRAINT "statistiques_equipe_lol_partie_id_fkey" FOREIGN KEY ("partie_id") REFERENCES "parties_lol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statistiques_joueur_lol" ADD CONSTRAINT "statistiques_joueur_lol_partie_id_fkey" FOREIGN KEY ("partie_id") REFERENCES "parties_lol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statistiques_joueur_lol" ADD CONSTRAINT "statistiques_joueur_lol_joueur_id_fkey" FOREIGN KEY ("joueur_id") REFERENCES "joueurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dragons_lol" ADD CONSTRAINT "dragons_lol_partie_id_fkey" FOREIGN KEY ("partie_id") REFERENCES "parties_lol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cartes_valorant" ADD CONSTRAINT "cartes_valorant_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matchs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statistiques_equipe_valorant" ADD CONSTRAINT "statistiques_equipe_valorant_carte_id_fkey" FOREIGN KEY ("carte_id") REFERENCES "cartes_valorant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statistiques_joueur_valorant" ADD CONSTRAINT "statistiques_joueur_valorant_carte_id_fkey" FOREIGN KEY ("carte_id") REFERENCES "cartes_valorant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statistiques_joueur_valorant" ADD CONSTRAINT "statistiques_joueur_valorant_joueur_id_fkey" FOREIGN KEY ("joueur_id") REFERENCES "joueurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ===========================================================================
-- Regles de coherence -- A LA MAIN
-- ===========================================================================
--
-- L'API verifie deja chacune de ces regles. Les repeter ici est le dernier
-- filet, comme a l'etape 7 : un script de peuplement mal ecrit ou une
-- requete lancee depuis DBeaver ne passeront pas non plus.

-- La discipline et l'univers ne peuvent pas se contredire : une competition
-- est de football dans les deux colonnes, ou dans aucune.
ALTER TABLE "competitions"
  ADD CONSTRAINT "competitions_discipline_coherente"
  CHECK (("discipline" = 'football') = ("univers" = 'football'));

-- Football : des compteurs positifs, une possession en pourcentage, et pas
-- plus de tirs cadres que de tirs ni de passes reussies que de passes.
ALTER TABLE "statistiques_football"
  ADD CONSTRAINT "statistiques_football_valeurs"
  CHECK (
    "possession" BETWEEN 0 AND 100
    AND "tirs" >= 0 AND "tirs_cadres" BETWEEN 0 AND "tirs"
    AND "corners" >= 0 AND "fautes" >= 0 AND "hors_jeu" >= 0
    AND "cartons_jaunes" >= 0 AND "cartons_rouges" >= 0
    AND "passes" >= 0 AND "passes_reussies" BETWEEN 0 AND "passes"
    AND "arrets" >= 0
  );

-- Un but tombe entre la 1re et la 120e minute (prolongations comprises). Le
-- temps additionnel n'existe qu'a la fin d'une periode de jeu.
ALTER TABLE "buts"
  ADD CONSTRAINT "buts_minute"
  CHECK (
    "minute" BETWEEN 1 AND 120
    AND ("temps_additionnel" IS NULL
         OR ("temps_additionnel" BETWEEN 1 AND 30 AND "minute" IN (45, 90, 105, 120)))
  );

-- Une serie compte au plus cinq manches (« BO5 »).
ALTER TABLE "parties_lol"
  ADD CONSTRAINT "parties_lol_valeurs"
  CHECK ("numero" BETWEEN 1 AND 5 AND "duree" >= 0);

ALTER TABLE "cartes_valorant"
  ADD CONSTRAINT "cartes_valorant_numero"
  CHECK ("numero" BETWEEN 1 AND 5);

-- Une carte de League of Legends compte onze tours par equipe.
ALTER TABLE "statistiques_equipe_lol"
  ADD CONSTRAINT "statistiques_equipe_lol_valeurs"
  CHECK (
    "tours" BETWEEN 0 AND 11
    AND "inhibiteurs" >= 0 AND "barons" >= 0 AND "herauts" >= 0 AND "larves" >= 0
  );

-- Un champion va du niveau 1 au niveau 18, et porte au plus sept objets
-- (six emplacements et une balise). cardinality() compte les elements d'un
-- tableau PostgreSQL.
ALTER TABLE "statistiques_joueur_lol"
  ADD CONSTRAINT "statistiques_joueur_lol_valeurs"
  CHECK (
    "kills" >= 0 AND "morts" >= 0 AND "assistances" >= 0
    AND "sbires" >= 0 AND "gold" >= 0
    AND "niveau" BETWEEN 1 AND 18
    AND cardinality("objets") <= 7
  );

ALTER TABLE "dragons_lol"
  ADD CONSTRAINT "dragons_lol_ordre"
  CHECK ("ordre" >= 1);

ALTER TABLE "statistiques_equipe_valorant"
  ADD CONSTRAINT "statistiques_equipe_valorant_valeurs"
  CHECK ("rounds_attaque" >= 0 AND "rounds_defense" >= 0);

ALTER TABLE "statistiques_joueur_valorant"
  ADD CONSTRAINT "statistiques_joueur_valorant_valeurs"
  CHECK (
    "kills" >= 0 AND "morts" >= 0 AND "assistances" >= 0
    AND "acs" >= 0 AND "adr" >= 0
    AND "tirs_tete" BETWEEN 0 AND 100
    AND "premiers_kills" >= 0 AND "premieres_morts" >= 0
  );
