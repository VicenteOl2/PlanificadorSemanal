import React, { useState, useEffect } from "react";
import { auth } from "./firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import Home from "./pages/Home";

const AuthMenu: React.FC<{ user: User | null }> = ({ user }) => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, pass);
      } else {
        await signInWithEmailAndPassword(auth, email, pass);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return user ? (
    <div style={{ textAlign: "center", margin: 20 }}>
      <span>Sesión iniciada como <b>{user.email}</b></span>
      <button onClick={() => signOut(auth)} style={{ marginLeft: 10 }}>Cerrar sesión</button>
    </div>
  ) : (
    <form onSubmit={handleAuth} style={{ textAlign: "center", margin: 20 }}>
      <h2>{isRegister ? "Registro" : "Iniciar sesión"}</h2>
      <input
        type="email"
        placeholder="Correo"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        style={{ margin: 5 }}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={pass}
        onChange={e => setPass(e.target.value)}
        required
        style={{ margin: 5 }}
      />
      <button type="submit">{isRegister ? "Registrarse" : "Entrar"}</button>
      <div>
        <button type="button" onClick={() => setIsRegister(!isRegister)} style={{ marginTop: 10 }}>
          {isRegister ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
        </button>
      </div>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  return (
    <div>
      <AuthMenu user={user} />
      {user && <Home userEmail={user.email || ""} />}
    </div>
  );
};

export default App;