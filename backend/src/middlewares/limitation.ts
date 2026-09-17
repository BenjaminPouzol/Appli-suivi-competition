import { rateLimit } from 'express-rate-limit';

/**
 * Etape 8 : limite le nombre de tentatives de connexion et d'inscription.
 *
 * Sans limite, un script peut essayer des milliers de mots de passe par
 * minute sur un compte : c'est l'attaque par FORCE BRUTE. Argon2 la ralentit
 * deja ; la limitation la rend impraticable.
 *
 * Au-dela de 10 ECHECS en 15 minutes depuis la meme adresse IP, le serveur
 * repond 429 (« Too Many Requests ») sans meme regarder le mot de passe.
 * Les tentatives reussies ne comptent pas : se connecter normalement plusieurs
 * fois dans la journee ne doit bloquer personne.
 *
 * Limite connue : le compteur vit dans la memoire du serveur. Il repart de
 * zero a chaque redemarrage, et ne serait pas partage entre plusieurs
 * serveurs. Suffisant pour ce projet ; une application a fort trafic
 * rangerait ce compteur dans un stockage partage (Redis, par exemple).
 */
export const limiterTentatives = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  // Seules les reponses en erreur (code 400 ou plus) sont comptees.
  skipSuccessfulRequests: true,
  // Envoie les en-tetes normalises RateLimit-* : le client peut savoir
  // combien de tentatives il lui reste, et quand le compteur se remet a zero.
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { erreur: 'Trop de tentatives. Réessaie dans quelques minutes.' },
});
