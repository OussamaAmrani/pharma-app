import React, { useState } from "react";
import { createVente } from "../../api/ventesApi";

function VenteForm({ medicaments }) {

  const [panier, setPanier] = useState([]);
  const [medicamentId, setMedicamentId] = useState("");
  const [quantite, setQuantite] = useState(1);

  const ajouterAuPanier = () => {
    const medicament = medicaments.find(m => m.id == medicamentId);

    const ligne = {
      medicament: medicament.id,
      nom: medicament.nom,
      prix_unitaire: medicament.prix,
      quantite: quantite,
      sous_total: medicament.prix * quantite
    };

    setPanier([...panier, ligne]);
  };

  const total = panier.reduce((sum, item) => sum + item.sous_total, 0);

  const enregistrerVente = async () => {
    const data = {
      lignes: panier
    };

    await createVente(data);
    alert("Vente enregistrée !");
    setPanier([]);
  };

  return (
    <div>

      <h2>Nouvelle Vente</h2>

      <select onChange={(e) => setMedicamentId(e.target.value)}>
        <option>Choisir médicament</option>

        {medicaments.map(m => (
          <option key={m.id} value={m.id}>
            {m.nom}
          </option>
        ))}

      </select>

      <input
        type="number"
        value={quantite}
        onChange={(e) => setQuantite(e.target.value)}
      />

      <button onClick={ajouterAuPanier}>
        Ajouter
      </button>

      <h3>Panier</h3>

      <ul>
        {panier.map((item, index) => (
          <li key={index}>
            {item.nom} - {item.quantite} × {item.prix_unitaire} = {item.sous_total}
          </li>
        ))}
      </ul>

      <h3>Total : {total}</h3>

      <button onClick={enregistrerVente}>
        Valider la vente
      </button>

    </div>
  );
}

export default VenteForm;