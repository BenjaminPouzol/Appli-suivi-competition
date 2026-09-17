-- Etape 7 : regles de coherence posees directement dans la base.
--
-- Cette migration a ete creee VIDE avec « prisma migrate dev --create-only »,
-- puis completee a la main : le schema Prisma ne sait pas exprimer une
-- contrainte CHECK. C'est le cas d'usage prevu de --create-only -- ecrire soi-
-- meme le SQL d'une migration avant de l'appliquer.
--
-- L'API verifie deja ces deux regles. Les repeter ici n'est pas un doublon
-- inutile : c'est le dernier filet. Un script de peuplement mal ecrit, une
-- requete lancee depuis DBeaver ou un bug futur dans la validation ne
-- passeront pas non plus.

-- Un match oppose deux equipes DIFFERENTES.
ALTER TABLE "matchs"
  ADD CONSTRAINT "matchs_equipes_differentes"
  CHECK ("domicile_id" <> "exterieur_id");

-- Un score est absent (NULL) ou positif. En SQL, une comparaison avec NULL
-- ne vaut ni vrai ni faux : une contrainte CHECK laisse donc passer NULL, ce
-- qui est exactement le comportement voulu pour un match pas encore joue.
ALTER TABLE "matchs"
  ADD CONSTRAINT "matchs_scores_positifs"
  CHECK ("score_domicile" >= 0 AND "score_exterieur" >= 0);
