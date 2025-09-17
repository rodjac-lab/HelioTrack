export function createInputsSection() {
  const section = document.createElement("section");
  section.className = "panel";
  section.innerHTML = `
    <h3>Entrées</h3>
    <div class="form-field">
      <label for="input-lat">Latitude (°)</label>
      <input id="input-lat" type="number" min="-90" max="90" step="0.0001" />
    </div>
    <div class="form-field">
      <label for="input-lon">Longitude (°)</label>
      <input id="input-lon" type="number" min="-180" max="180" step="0.0001" />
    </div>
    <div class="form-field">
      <label for="input-orientation">Azimut façade principale (°)</label>
      <input id="input-orientation" type="number" min="0" max="360" step="1" />
      <small>0°=Nord • 90°=Est • 180°=Sud • 270°=Ouest</small>
    </div>
    <div class="form-field-inline">
      <label for="input-tz">Décalage fuseau (h)</label>
      <input id="input-tz" type="number" step="0.25" min="-12" max="12" />
    </div>
    <div class="form-field-checkbox">
      <input id="input-use-civil" type="checkbox" />
      <label for="input-use-civil">Afficher les heures en temps civil approx.</label>
    </div>
  `;
  return section;
}

export function createInfoSection() {
  const section = document.createElement("section");
  section.className = "panel";
  section.innerHTML = `
    <h3>Contrôles 3D</h3>
    <p><strong>Souris :</strong> rotation de la vue</p>
    <p><strong>Molette :</strong> zoom avant/arrière</p>
    <p><strong>Clic droit :</strong> panoramique</p>
    <p><strong>Boutons :</strong> vues prédéfinies (dessus, profil, iso, libre)</p>
  `;
  return section;
}
