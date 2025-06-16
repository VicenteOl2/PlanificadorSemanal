import React, { useState } from "react";
import "../Auth.css";

interface AuthProps {
  onAuth: (email: string, password: string, isRegister: boolean) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuth }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAuth(email, password, isRegister);
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <img src="/logo.png" alt="Logo" className="auth-logo" />
        <h2>{isRegister ? "Registro" : "Iniciar sesión"}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button type="submit">{isRegister ? "Registrarse" : "Entrar"}</button>
        </form>
        <div className="auth-footer">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            style={{ background: "none", border: "none", color: "#1976d2", cursor: "pointer", textDecoration: "underline" }}
          >
            {isRegister ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;