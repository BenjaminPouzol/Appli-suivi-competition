import { Router } from 'express';
import { obtenirMatchs } from '../controleurs/matchs.controleur';

export const routeurMatchs = Router();

routeurMatchs.get('/', obtenirMatchs);
