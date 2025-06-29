// src/App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Auth from "./pages/Auth";
import Registro from "./components/Registro";
import RequireAuth from "./RequireAuth";

import Home from "./pages/Home";
import CalendarPage from "./pages/CalendarPage";
import NegocioDetalle from "./components/NegocioDetalle";
import ReservasNegocio from "./components/ReservasNegocio";
import WeeklyPlanner from "./components/WeeklyPlanner";

const App: React.FC = () => {
  return (
    <>
      {/* Opcional: prueba que carga */}
      <div style={{ position: "fixed", top: 0, right: 0, padding: 4, color: "#888" }}>
        v1.0 – Si ves esto, App se está montando
      </div>

      <Routes>
        {/* raíz → login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* PÚBLICAS */}
        <Route path="/login" element={<Auth />} />
        <Route path="/registro" element={<Registro />} />

        {/* PRIVADAS */}
        <Route element={<RequireAuth />}>
          <Route path="/home" element={<Home userEmail="prueba@email.com"/>} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/negocio/:id" element={<NegocioDetalle />} />
          <Route path="/negocio/:id/reservas" element={<ReservasNegocio />} />
          <Route path="/weekly-planner" element={<WeeklyPlanner />} />
        </Route>

        {/* CUALQUIER OTRA → login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
};

export default App;