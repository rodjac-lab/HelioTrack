# HelioTrack

## FR
Simulateur de la course du soleil face a une maison. Le projet affiche la trajectoire solaire selon la date et permet d'observer l'ensoleillement de la parcelle en 2D et 3D, avec simulation de panneaux solaires.

### Fonctionnalités principales
- **Visualisation 3D interactive** : Naviguez autour de la scène avec les contrôles orbitaux (souris/tactile)
- **Simulation temporelle** : Sélectionnez n'importe quel jour de l'année et heure solaire
- **Animations** : Visualisez la course du soleil sur une journée ou une année entière
- **Panneaux solaires** : Installez des panneaux virtuels et visualisez leur efficacité en temps réel
- **Indicateurs détaillés** : Altitude, azimut, irradiance, angle d'incidence, moments clés (lever/coucher)
- **Vues prédéfinies** : Dessus, profil, isométrique, ou libre
- **Presets de localisation** : Rome, Lyon, Amsterdam, Oslo
- **Mode responsive** : Interface adaptative pour desktop, tablette et mobile

### Installation et lancement
1. Installer les dependances : `npm install`.
2. Demarrer le serveur Vite : `npm run dev`.
   - L'outil est servi sur `http://localhost:5173/` par defaut. Utilise le parametre `--host` ou `--port` si tu veux changer l'adresse.
3. Construire la version finale : `npm run build` (artifacts dans `dist/`).
4. Previsualiser le build : `npm run preview` (sert le contenu de `dist/` via Vite).

### Utilisation
1. **Panneau gauche** : Sélectionnez le jour et l'heure avec les curseurs, ou utilisez les presets de ville
2. **Barre d'outils** : Changez de vue 3D, lancez des animations, installez/retirez les panneaux solaires
3. **Panneau droit** : Consultez les indicateurs en temps réel et les paramètres avancés

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
Interactive 3D solar path simulator with solar panel efficiency analysis. It displays the sun's trajectory for any day of the year and shows the sunlight impact around the building with real-time metrics.

### Key Features
- **Interactive 3D visualization** : Navigate around the scene with orbital controls (mouse/touch)
- **Time simulation** : Select any day of year and solar time
- **Animations** : Visualize the sun's path over a day or entire year
- **Solar panels** : Install virtual panels and see their real-time efficiency
- **Detailed metrics** : Altitude, azimuth, irradiance, incidence angle, key moments (sunrise/sunset)
- **Preset views** : Top, side, isometric, or free camera
- **Location presets** : Rome, Lyon, Amsterdam, Oslo
- **Responsive design** : Adaptive interface for desktop, tablet, and mobile

### Installation and usage
1. Install dependencies: `npm install`.
2. Start the Vite dev server: `npm run dev` (defaults to `http://localhost:5173/`).
3. Build for production: `npm run build` (outputs to `dist/`).
4. Preview the production bundle: `npm run preview`.

### How to use
1. **Left panel** : Select day and time with sliders, or use city presets
2. **Toolbar** : Change 3D view, run animations, install/remove solar panels
3. **Right panel** : View real-time indicators and advanced settings

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
