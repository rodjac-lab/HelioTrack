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

## 🧪 Vérification des calculs solaires
- Lancer `node tests/solarEngine.snapshots.mjs` pour comparer le moteur modulaire
  avec les formules historiques (36 combinaisons jour/heure/latitude + événements clés).

## 🧰 Développement
- Le layout “trois panneaux” (`assets/styles.css`) s’adapte désormais aux écrans moyens :
  la colonne droite passe en tiroir sous 1200 px et reste accessible via le bouton “📊 Onglets”.
- Les modules `src/view3d/viewer.js` et `src/ui/rightPanel.js` utilisent un `ResizeObserver`
  et un store pub/sub (`src/state/store.js`) pour réagir aux changements sans accès direct au DOM legacy.

---

## 📂 Structure prévue du projet
- `index.html` → page principale du simulateur
- `src/` → fichiers JavaScript et modules
- `assets/` → styles, images, données statiques  

---

## 📜 Licence
Ce projet est partagé à titre expérimental.  
This project is shared for experimental purposes.
