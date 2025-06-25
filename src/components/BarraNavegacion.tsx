import React from "react";
import { Link } from "react-router-dom";

const BarraNavegacion: React.FC = () => (
  <nav style={{
    background: "#1976d2",
    padding: "1rem",
    display: "flex",
    justifyContent: "center",
    gap: "2rem"
  }}>
    <Link to="/home" style={{ color: "#fff", textDecoration: "none", fontWeight: "bold" }}>
      Inicio
    </Link>
    <Link to="/calendar" style={{ color: "#fff", textDecoration: "none", fontWeight: "bold" }}>
      Calendario
    </Link>
  </nav>
);

export default BarraNavegacion;