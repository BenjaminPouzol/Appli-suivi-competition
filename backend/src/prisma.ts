import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client';

/**
 * Le client Prisma : le seul objet par lequel le code parle a la base.
 *
 * Il est cree UNE SEULE FOIS et partage par toute l'application. Chaque
 * client ouvre en effet un pool de connexions vers PostgreSQL, et une base
 * n'en accepte qu'un nombre limite -- en creer un par requete epuiserait ce
 * budget en quelques secondes.
 *
 * L'adaptateur PrismaPg est la piece qui parle reellement le protocole
 * PostgreSQL. Depuis Prisma 7, c'est le code du projet qui le fournit, ce qui
 * rend visible d'ou vient la connexion au lieu de la cacher dans l'outil.
 */
const adaptateur = new PrismaPg({
  connectionString: process.env['DATABASE_URL'],
});

export const prisma = new PrismaClient({ adapter: adaptateur });
