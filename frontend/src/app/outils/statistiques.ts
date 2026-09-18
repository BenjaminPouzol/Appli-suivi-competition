/**
 * Etape 10 : petites fonctions de mise en forme des statistiques.
 *
 * Ce sont des fonctions PURES : leur resultat ne depend que de leurs
 * arguments, et elles ne modifient rien. On les teste donc sans rien simuler
 * (voir statistiques.spec.ts), et les composants restent courts.
 */

/**
 * Espace insecable fine, placee avant « % » ou « k » en typographie
 * francaise : « 58 % » ne doit jamais etre coupe en fin de ligne.
 */
const ESPACE_FINE = ' ';

/** 1985 secondes -> « 33:05 » ; 3725 -> « 1:02:05 ». */
export function formaterDuree(secondes: number): string {
  const heures = Math.floor(secondes / 3600);
  const minutes = Math.floor((secondes % 3600) / 60);
  const reste = secondes % 60;

  // padStart complete a gauche : 5 -> « 05 ».
  const deuxChiffres = (valeur: number) => String(valeur).padStart(2, '0');

  return heures > 0
    ? `${heures}:${deuxChiffres(minutes)}:${deuxChiffres(reste)}`
    : `${minutes}:${deuxChiffres(reste)}`;
}

/** 16990 -> « 17,0 k » ; 950 -> « 950 ». Le gold se lit en milliers. */
export function formaterMilliers(valeur: number): string {
  if (valeur < 1000) {
    return String(valeur);
  }
  return `${(valeur / 1000).toFixed(1).replace('.', ',')}${ESPACE_FINE}k`;
}

/** 356 sur 402 -> 89 (%, arrondi). Zero sur zero donne zero, et non une division impossible. */
export function pourcentage(partie: number, total: number): number {
  return total === 0 ? 0 : Math.round((partie / total) * 100);
}

/** 42 -> « 42 % », avec l'espace insecable de la typographie francaise. */
export function formaterPourcentage(valeur: number): string {
  return `${valeur}${ESPACE_FINE}%`;
}

/**
 * La part de chaque cote dans un total, en pourcentage : sert a dessiner les
 * barres de comparaison. Deux zeros donnent une egalite parfaite.
 */
export function parts(domicile: number, exterieur: number): [number, number] {
  const total = domicile + exterieur;
  if (total === 0) {
    return [50, 50];
  }
  const partDomicile = (domicile / total) * 100;
  return [partDomicile, 100 - partDomicile];
}

/** Minute 45, temps additionnel 2 -> « 45+2’ » ; minute 12 -> « 12’ ». */
export function formaterMinute(minute: number, tempsAdditionnel: number | null): string {
  return tempsAdditionnel === null ? `${minute}’` : `${minute}+${tempsAdditionnel}’`;
}

/** 5 -> « +5 », -3 -> « −3 » (vrai signe moins), 0 -> « 0 ». */
export function formaterEcart(ecart: number): string {
  if (ecart > 0) {
    return `+${ecart}`;
  }
  return ecart < 0 ? `−${Math.abs(ecart)}` : '0';
}
