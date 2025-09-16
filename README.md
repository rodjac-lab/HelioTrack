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
- Sous 1200 px de large, le panneau latéral droit devient un tiroir superposé accessible via le bouton « Afficher les résultats » situé au-dessus de la zone centrale.
- Le tiroir peut être refermé via le bouton « ✕ Fermer », en appuyant sur `Échap` ou en touchant l’arrière-plan estompé.
- La navigation entre les onglets du panneau a été vérifiée manuellement sur une largeur de fenêtre ≤ 1200 px.

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
