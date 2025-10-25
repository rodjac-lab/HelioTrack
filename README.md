# HelioTrack 🌞

**FR**  
Petit simulateur de la course du soleil devant une maison, en fonction du jour de l'année.  
L’outil affiche la trajectoire solaire et permet de visualiser l’ensoleillement à différentes périodes.

**EN**  
A simple simulator of the sun’s path in front of a house, depending on the day of the year.  
The tool displays the solar trajectory and helps visualize sunlight at different times of the year.

---

## 🚀 Utilisation / Usage

- Ouvrir le fichier `index.html` dans un navigateur web.
- Sélectionner un jour de l’année pour afficher la trajectoire correspondante.
- Observer la position du soleil et son impact sur l’ensoleillement de la maison.

## 📱 Mode responsive

- ≥ 1200 px : les trois colonnes restent visibles. Le panneau de droite peut se comprimer grâce à `minmax(280px, 360px)` tandis que la zone centrale utilise `minmax(0, 1fr)` pour éviter tout défilement horizontal.
- Entre 900 px et 1200 px : le panneau droit se transforme en tiroir superposé, accessible via le bouton « Afficher les résultats » ajouté au-dessus de la barre d’outils centrale. Il se referme avec « ✕ Fermer », la touche `Échap` ou un appui sur l’arrière-plan estompé.
- ≤ 900 px : la colonne gauche est masquée afin de laisser toute la largeur au contenu principal ; le tiroir droit reste accessible via le même bouton.
- Tests manuels réalisés sur un viewport de 1366 px (~14″) et sur des largeurs inférieures (tablette et mobile) pour vérifier l’accessibilité du tiroir et l’absence de débordement horizontal.

## 🧪 Vérification des calculs solaires

- Lancer `npm run test:snapshots` pour comparer le moteur modulaire
  avec les formules historiques (36 combinaisons jour/heure/latitude + événements clés).
- Ce script doit absolument réussir **avant toute Pull Request** afin de garder le moteur
  solaire sous contrôle et éviter toute dérive numérique.

---

## 📂 Structure prévue du projet

- `index.html` → page principale du simulateur
- `src/` → fichiers JavaScript et modules
- `assets/` → styles, images, données statiques

---

## 📜 Licence

Ce projet est partagé à titre expérimental.  
This project is shared for experimental purposes.
