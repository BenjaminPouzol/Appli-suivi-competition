import { Router } from 'express';
import { listerMatchs } from '../controleurs/matchs.controleur';

export const routeurMatchs = Router();

routeurMatchs.get('/', listerMatchs);
