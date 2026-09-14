#!/usr/bin/env bash
#
# Genere les captures d'ecran qui illustrent le document d'apprentissage.
#
# Principe : on pilote Microsoft Edge en mode « headless » (sans fenetre
# visible). Le navigateur charge l'application, attend que le JavaScript ait
# fini de construire la page, puis enregistre une image PNG.
#
# Prerequis : le serveur de developpement doit tourner.
#     cd frontend && npm start
#
# Utilisation, depuis la racine du depot :
#     bash scripts/captures.sh etape-01
#
set -euo pipefail

PREFIXE="${1:-}"
if [ -z "$PREFIXE" ]; then
  echo "Usage : bash scripts/captures.sh <prefixe>   (exemple : etape-01)" >&2
  exit 1
fi

BASE_URL="http://localhost:4200"
RACINE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOSSIER_SORTIE="$RACINE/docs/images"

# Edge s'installe a l'un ou l'autre de ces deux emplacements selon les machines.
EDGE=""
for chemin in \
  "/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" \
  "/c/Program Files/Microsoft/Edge/Application/msedge.exe"
do
  if [ -x "$chemin" ]; then EDGE="$chemin"; break; fi
done

if [ -z "$EDGE" ]; then
  echo "Microsoft Edge est introuvable." >&2
  exit 1
fi

if ! curl -s -o /dev/null --max-time 5 "$BASE_URL/"; then
  echo "Le serveur ne repond pas sur $BASE_URL" >&2
  echo "Lance-le d'abord avec :  cd frontend && npm start" >&2
  exit 1
fi

mkdir -p "$DOSSIER_SORTIE"

# Chaque ligne associe un nom de fichier a la route correspondante.
PAGES="accueil:/ competitions:/competitions a-propos:/a-propos"

for page in $PAGES; do
  nom="${page%%:*}"
  route="${page#*:}"
  sortie="$DOSSIER_SORTIE/$PREFIXE-$nom.png"

  # --headless=old      : seul mode qui sait encore ecrire un PNG directement
  # --virtual-time-budget : laisse au JavaScript le temps de construire la page
  # --hide-scrollbars   : evite une barre de defilement disgracieuse sur l'image
  rm -f "$sortie"

  "$EDGE" \
    --headless=old \
    --disable-gpu \
    --hide-scrollbars \
    --window-size=1280,860 \
    --virtual-time-budget=6000 \
    --screenshot="$(cygpath -w "$sortie")" \
    "$BASE_URL$route" >/dev/null 2>&1

  # Edge rend la main avant d'avoir fini d'ecrire le fichier : on attend
  # que celui-ci apparaisse, plutot que de conclure trop tot a un echec.
  for _ in $(seq 1 30); do
    [ -s "$sortie" ] && break
    sleep 0.5
  done

  if [ -s "$sortie" ]; then
    echo "OK    $PREFIXE-$nom.png"
  else
    echo "ECHEC $PREFIXE-$nom.png" >&2
  fi
done

echo "Captures enregistrees dans docs/images/"
