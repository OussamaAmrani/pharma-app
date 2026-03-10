// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PharmacyLayout from "./components/Layout/PharmacyLayout";
import DashboardPage from "./pages/DashboardPage";
import MedicamentsPage from "./pages/MedicamentsPage";
import VentesPage from "./pages/VentesPage";
import CategoriesPage from "./pages/CategoriesPage";

function App() {
  return (
    <Router>
      <PharmacyLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/medicaments" element={<MedicamentsPage />} />
          <Route path="/ventes" element={<VentesPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
        </Routes>
      </PharmacyLayout>
    </Router>
  );
}

export default App;