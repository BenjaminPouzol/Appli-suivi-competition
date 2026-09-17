import { Routes } from '@angular/router';
import { Accueil } from './pages/accueil/accueil';
import { Matchs } from './pages/matchs/matchs';
import { MatchFormulaire } from './pages/match-formulaire/match-formulaire';
import { Competitions } from './pages/competitions/competitions';
import { CompetitionFormulaire } from './pages/competition-formulaire/competition-formulaire';
import { APropos } from './pages/a-propos/a-propos';
import { Connexion } from './pages/connexion/connexion';
import { Inscription } from './pages/inscription/inscription';
import { AccesRefuse } from './pages/acces-refuse/acces-refuse';
import { administrateurRequis } from './gardes/authentification';

export const routes: Routes = [
  { path: '', component: Accueil, title: 'Accueil — Suivi Compétition' },

  { path: 'matchs', component: Matchs, title: 'Matchs — Suivi Compétition' },

  // Etape 7 : le meme composant sert deux adresses. Il distingue les deux
  // cas en regardant si l'adresse contient un « :id ».
  // Etape 8 : « canActivate » fait consulter la garde avant d'afficher la page.
  {
    path: 'matchs/nouveau',
    component: MatchFormulaire,
    canActivate: [administrateurRequis],
    title: 'Nouveau match — Suivi Compétition',
  },
  {
    path: 'matchs/:id/modifier',
    component: MatchFormulaire,
    canActivate: [administrateurRequis],
    title: 'Modifier un match — Suivi Compétition',
  },

  { path: 'competitions', component: Competitions, title: 'Compétitions — Suivi Compétition' },
  {
    path: 'competitions/nouvelle',
    component: CompetitionFormulaire,
    canActivate: [administrateurRequis],
    title: 'Nouvelle compétition — Suivi Compétition',
  },
  {
    path: 'competitions/:id/modifier',
    component: CompetitionFormulaire,
    canActivate: [administrateurRequis],
    title: 'Modifier une compétition — Suivi Compétition',
  },

  { path: 'a-propos', component: APropos, title: 'À propos — Suivi Compétition' },

  // Etape 8 : l'authentification.
  { path: 'connexion', component: Connexion, title: 'Connexion — Suivi Compétition' },
  { path: 'inscription', component: Inscription, title: 'Créer un compte — Suivi Compétition' },
  { path: 'acces-refuse', component: AccesRefuse, title: 'Accès réservé — Suivi Compétition' },

  { path: '**', redirectTo: '' },
];
