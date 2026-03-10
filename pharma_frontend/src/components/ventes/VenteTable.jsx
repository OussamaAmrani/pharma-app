import React from "react";

const VenteTable = ({ ventes }) => (
  <table border={1} style={{ width: "100%", marginTop: "2rem" }}>
    <thead>
      <tr>
        <th>Référence</th>
        <th>Date</th>
        <th>Total TTC</th>
        <th>Statut</th>
      </tr>
    </thead>
    <tbody>
      {ventes.map((v) => (
        <tr key={v.id}>
          <td>{v.reference}</td>
          <td>{new Date(v.date_vente).toLocaleString()}</td>
          <td>{v.total_ttc}</td>
          <td>{v.statut}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default VenteTable;