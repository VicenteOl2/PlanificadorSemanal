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
import { requestNotificationPermission } from "./firebaseMessaging"; // <-- AGREGA ESTE IMPORT

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

  // <-- AGREGA ESTE useEffect DESPUÉS DEL useEffect ANTERIOR
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

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            !user ? (
              <>
                <Auth onAuth={handleAuth} />
                {error && <div style={{ color: "red", textAlign: "center" }}>{error}</div>}
              </>
            ) : null
          }
        />
        <Route
          path="/home"
          element={
            user ? (
              <>
                <div style={{ textAlign: "center", margin: 20 }}>
                  <span>Sesión iniciada como <b>{user.email}</b></span>
                  <button onClick={handleSignOut} style={{ marginLeft: 10 }}>Cerrar sesión</button>
                </div>
                <Home userEmail={user.email || ""} />
              </>
            ) : null
          }
        />
      </Routes>
    </>
  );
};

const App: React.FC = () => (
  <Router>
    <AuthWrapper />
  </Router>
);

export default App;