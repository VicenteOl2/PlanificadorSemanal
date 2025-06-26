// src/pages/Auth.tsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

const Auth: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();              // ← Hook DENTRO de un Router

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/home", { replace: true });     // ← Funciona ahora
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 320, margin: "100px auto" }}>
      <h2>Iniciar sesión</h2>
      <input
        type="email"
        placeholder="Correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Entrar</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p style={{ marginTop: 12 }}>
        ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
      </p>
    </form>
  );
};

export default Auth;