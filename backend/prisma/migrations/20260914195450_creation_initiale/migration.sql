-- CreateEnum
CREATE TYPE "Univers" AS ENUM ('esport', 'football');

-- CreateEnum
CREATE TYPE "StatutMatch" AS ENUM ('a_venir', 'en_direct', 'termine');

-- CreateTable
CREATE TABLE "competitions" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "organisateur" TEXT NOT NULL,
    "univers" "Univers" NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "competitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipes" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "trigramme" TEXT NOT NULL,

    CONSTRAINT "equipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matchs" (
    "id" TEXT NOT NULL,
    "score_domicile" INTEGER,
    "score_exterieur" INTEGER,
    "date" TIMESTAMP(3) NOT NULL,
    "statut" "StatutMatch" NOT NULL,
    "competition_id" TEXT NOT NULL,
    "domicile_id" TEXT NOT NULL,
    "exterieur_id" TEXT NOT NULL,

    CONSTRAINT "matchs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "matchs_statut_idx" ON "matchs"("statut");

-- CreateIndex
CREATE INDEX "matchs_competition_id_idx" ON "matchs"("competition_id");

-- CreateIndex
CREATE INDEX "matchs_date_idx" ON "matchs"("date");

-- AddForeignKey
ALTER TABLE "matchs" ADD CONSTRAINT "matchs_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matchs" ADD CONSTRAINT "matchs_domicile_id_fkey" FOREIGN KEY ("domicile_id") REFERENCES "equipes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matchs" ADD CONSTRAINT "matchs_exterieur_id_fkey" FOREIGN KEY ("exterieur_id") REFERENCES "equipes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
