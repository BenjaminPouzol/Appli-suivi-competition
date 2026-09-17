import { Router } from 'express';
import { connecter, inscrire, obtenirMoi } from '../controleurs/auth.controleur';
import { authentifier } from '../middlewares/authentification';
import { limiterTentatives } from '../middlewares/limitation';

/** Etape 8 : inscription, connexion, et « qui suis-je ? ». */
export const routeurAuth = Router();

// La limitation passe AVANT le controleur : une tentative de trop est
// refusee sans meme calculer d'empreinte Argon2.
routeurAuth.post('/inscription', limiterTentatives, inscrire);
routeurAuth.post('/connexion', limiterTentatives, connecter);

routeurAuth.get('/moi', authentifier, obtenirMoi);
