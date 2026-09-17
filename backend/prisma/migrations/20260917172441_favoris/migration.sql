-- CreateTable
CREATE TABLE "favoris" (
    "utilisateur_id" TEXT NOT NULL,
    "equipe_id" TEXT NOT NULL,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favoris_pkey" PRIMARY KEY ("utilisateur_id","equipe_id")
);

-- CreateIndex
CREATE INDEX "favoris_equipe_id_idx" ON "favoris"("equipe_id");

-- AddForeignKey
ALTER TABLE "favoris" ADD CONSTRAINT "favoris_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoris" ADD CONSTRAINT "favoris_equipe_id_fkey" FOREIGN KEY ("equipe_id") REFERENCES "equipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
