import { Role } from '../app/modeles/utilisateur';

/**
 * Etape 8 : fabrique un jeton JWT pour les TESTS uniquement.
 *
 * Le frontend ne verifie jamais la signature d'un jeton (il n'a pas le
 * secret) : il se contente de lire son contenu. Un faux jeton, avec une
 * signature bidon, suffit donc a simuler n'importe quelle session.
 *
 * Ce fichier n'est importe que par des fichiers .spec.ts : il ne fait pas
 * partie de l'application construite.
 */
export function fabriquerJeton(options: {
  pseudo?: string;
  role?: Role;
  /** Expiration, en secondes a partir de maintenant (negatif = deja expire). */
  expireDans?: number;
} = {}): string {
  const { pseudo = 'Benjamin', role = 'utilisateur', expireDans = 3600 } = options;

  const enBase64Url = (objet: object): string => {
    // TextEncoder puis btoa : l'equivalent navigateur de Buffer.from(...).toString('base64url').
    const octets = new TextEncoder().encode(JSON.stringify(objet));
    const binaire = Array.from(octets, (octet) => String.fromCharCode(octet)).join('');
    return btoa(binaire).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };

  const entete = enBase64Url({ alg: 'HS256', typ: 'JWT' });
  const contenu = enBase64Url({
    sub: 'id-de-test',
    pseudo,
    role,
    exp: Math.floor(Date.now() / 1000) + expireDans,
  });

  return `${entete}.${contenu}.signature-bidon`;
}
