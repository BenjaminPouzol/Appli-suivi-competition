// Configuration de l'outil en ligne de commande Prisma.
//
// A ne pas confondre avec le client Prisma utilise par l'application
// (src/prisma.ts) : ce fichier-ci ne sert qu'aux commandes « npx prisma … ».
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',

  migrations: {
    path: 'prisma/migrations',

    // Commande executee par « npx prisma db seed », et automatiquement
    // apres une remise a zero de la base.
    seed: 'npx tsx prisma/seed.ts',
  },

  // Depuis Prisma 7, l'outil ne lit plus le fichier .env tout seul :
  // c'est l'import « dotenv/config » ci-dessus qui s'en charge.
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
