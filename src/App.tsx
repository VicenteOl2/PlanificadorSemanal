import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { auth } from "./firebaseConfig";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import "./Auth.css";
import { requestNotificationPermission } from "./firebaseMessaging";
import CalendarPage from "./pages/CalendarPage";
import BarraNavegacion from "./components/BarraNavegacion";
import NegocioDetalle from "./components/NegocioDetalle";
import ReservasNegocio from "./components/ReservasNegocio";



// Componente para manejar la autenticación y navegación
const AuthWrapper: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        navigate("/home");
      } else {
        navigate("/");
      }
    });
    return () => unsub();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (user) {
      requestNotificationPermission();
    }
  }, [user]);

  const handleAuth = async (email: string, password: string) => {
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // La navegación a /home se maneja en el useEffect
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    // La navegación a / se maneja en el useEffect
  };

  // Si el usuario NO está autenticado, solo muestra el login
  if (!user) {
    return (
      <>
        <Auth onAuth={handleAuth} />
        {error && <div style={{ color: "red", textAlign: "center" }}>{error}</div>}
      </>
    );
  }

  // Si el usuario está autenticado, muestra la barra y las rutas internas
  return (
    <>
      <BarraNavegacion />
      <div style={{ textAlign: "center", margin: 20 }}>
        <span>Sesión iniciada como <b>{user.email}</b></span>
        <button onClick={handleSignOut} style={{ marginLeft: 10 }}>Cerrar sesión</button>
      </div>
      <Routes>
        <Route path="/home" element={<Home userEmail={user.email || ""} />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="*" element={<Home userEmail={user.email || ""} />} />
        <Route path="/negocio/:id" element={<NegocioDetalle />} />
        <Route path="/negocio/:id/reservas" element={<ReservasNegocio />} />
      </Routes>
    </>
  );
};

// Estructura principal de la aplicación
const App: React.FC = () => (
  <Router>
    <AuthWrapper />
  </Router>
);

export default App;