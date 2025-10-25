# HelioTrack

## FR
Simulateur de la course du soleil face a une maison. Le projet affiche la trajectoire solaire selon la date et permet d'observer l'ensoleillement de la parcelle en 2D et 3D.

### Installation et lancement
1. Installer les dependances : `npm install`.
2. Demarrer le serveur Vite : `npm run dev`.
   - L'outil est servi sur `http://localhost:5173/` par defaut. Utilise le parametre `--host` ou `--port` si tu veux changer l'adresse.
3. Construire la version finale : `npm run build` (artifacts dans `dist/`).
4. Previsualiser le build : `npm run preview` (sert le contenu de `dist/` via Vite).

### Tests solaires
- `npm test` lance les unites puis les snapshots physiques.
- `npm run test:snapshots` compare le moteur numerique actuel a 36 cas de reference (combinaisons jour/heure/latitude + evenements clefs).  
  Ce script doit reussir avant toute PR afin de garantir la stabilite des calculs.

### Mode responsive
- >= 1200 px : les trois colonnes restent visibles. Le panneau droit est contraint par `minmax(280px, 360px)` tandis que la zone centrale s'etend via `minmax(0, 1fr)` pour eviter le scroll horizontal.
- 900 px -> 1199 px : le panneau droit devient un tiroir superpose accessible via le bouton « Afficher les resultats » place au-dessus de la barre d'outils centrale. Il se ferme avec « Fermer », `Esc` ou un clic sur le fond estompe.
- < 900 px : la colonne gauche est masquee pour laisser toute la largeur au contenu principal; le tiroir droit reste accessible via le meme bouton.
- Tests manuels realises sur un viewport de 1366 px (~14") et sur des largeurs inferieures (tablette et mobile) pour garantir l'accessibilite du tiroir et l'absence de debordement horizontal.

### Structure
- `index.html` : shell racine (monte l'application Vite et sert de fallback statique).
- `src/` : logique JS/TS et composants Three.js.
- `assets/` : styles, images et donnees statiques.
- `tests/` : harness numerique et snapshots.

## EN
Simple simulator of the sun path in front of a house. It displays the trajectory for any day of the year and shows the sunlight impact around the building.

### Installation and usage
1. Install dependencies: `npm install`.
2. Start the Vite dev server: `npm run dev` (defaults to `http://localhost:5173/`).
3. Build for production: `npm run build` (outputs to `dist/`).
4. Preview the production bundle: `npm run preview`.

### Solar validation
- `npm test` runs unit tests then the deterministic solar snapshots.
- `npm run test:snapshots` compares the current engine with 36 historical reference cases. Always keep it green before pushing.

### Responsive notes
- >= 1200 px: three columns stay visible; the right panel clamps to `minmax(280px, 360px)` while the center uses `minmax(0, 1fr)` to avoid overflow.
- 900 px -> 1199 px: the right column becomes an overlay drawer toggled by the “Afficher les resultats / Show results” button, closable via “Fermer / Close”, `Esc`, or the dimmed backdrop.
- < 900 px: the left column is hidden so the main canvas gets the full width; the drawer button still controls the results panel.
- Manual checks were done on a 1366 px laptop viewport plus smaller tablet/mobile widths.

## Licence
Projet partage a titre experimental.  
This project is shared for experimental purposes only.
