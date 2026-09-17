import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

/**
 * Etape 8 : donne le role d'administrateur a un compte existant.
 *
 * Utilisation, depuis le dossier backend/ :
 *     npm run utilisateur:promouvoir -- adresse@exemple.fr
 *
 * Pourquoi un script, et pas une route de l'API ? Parce qu'il faudrait deja
 * etre administrateur pour appeler cette route -- et qu'il faut bien un
 * premier administrateur. Un script lance sur le serveur regle la question :
 * seule une personne qui a acces a la machine (et a son fichier .env) peut
 * l'executer. Aucune porte n'est ouverte sur Internet.
 *
 * Les alternatives courantes ont chacune un defaut :
 *   - « le premier inscrit devient administrateur » : quiconque s'inscrit
 *     avant toi, sur un serveur tout juste deploye, prend le controle ;
 *   - un compte administrateur cree par le peuplement : il faudrait ecrire
 *     son mot de passe quelque part, dans le code ou dans .env.
 */

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error('Usage : npm run utilisateur:promouvoir -- adresse@exemple.fr');
  process.exit(1);
}

const adaptateur = new PrismaPg({ connectionString: process.env['DATABASE_URL'] });
const prisma = new PrismaClient({ adapter: adaptateur });

async function promouvoir(adresse: string): Promise<void> {
  // updateMany plutot que update : il ne leve pas d'erreur si l'adresse est
  // inconnue, il renvoie simplement le nombre de lignes modifiees.
  const resultat = await prisma.utilisateur.updateMany({
    where: { email: adresse },
    data: { role: 'administrateur' },
  });

  if (resultat.count === 0) {
    console.error(`Aucun compte avec l'adresse ${adresse}. Inscris-toi d'abord depuis l'application.`);
    process.exitCode = 1;
    return;
  }

  console.log(`${adresse} est maintenant administrateur.`);
  console.log('Déconnecte-toi puis reconnecte-toi : ton jeton actuel porte encore l’ancien rôle.');
}

promouvoir(email)
  .catch((erreur) => {
    console.error('La promotion a échoué :', erreur);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
