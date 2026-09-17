import { Routes } from '@angular/router';
import { Accueil } from './pages/accueil/accueil';
import { Matchs } from './pages/matchs/matchs';
import { MatchFormulaire } from './pages/match-formulaire/match-formulaire';
import { Competitions } from './pages/competitions/competitions';
import { CompetitionFormulaire } from './pages/competition-formulaire/competition-formulaire';
import { APropos } from './pages/a-propos/a-propos';

export const routes: Routes = [
  { path: '', component: Accueil, title: 'Accueil — Suivi Compétition' },

  { path: 'matchs', component: Matchs, title: 'Matchs — Suivi Compétition' },

  // Etape 7 : le meme composant sert deux adresses. Il distingue les deux
  // cas en regardant si l'adresse contient un « :id ».
  {
    path: 'matchs/nouveau',
    component: MatchFormulaire,
    title: 'Nouveau match — Suivi Compétition',
  },
  {
    path: 'matchs/:id/modifier',
    component: MatchFormulaire,
    title: 'Modifier un match — Suivi Compétition',
  },

  { path: 'competitions', component: Competitions, title: 'Compétitions — Suivi Compétition' },
  {
    path: 'competitions/nouvelle',
    component: CompetitionFormulaire,
    title: 'Nouvelle compétition — Suivi Compétition',
  },
  {
    path: 'competitions/:id/modifier',
    component: CompetitionFormulaire,
    title: 'Modifier une compétition — Suivi Compétition',
  },

  { path: 'a-propos', component: APropos, title: 'À propos — Suivi Compétition' },
  { path: '**', redirectTo: '' },
];
