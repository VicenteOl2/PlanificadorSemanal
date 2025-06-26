import React, { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";

const RequireAuth: React.FC = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<null | {}>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setInitializing(false);
    });
    return () => unsub();
  }, []);

  if (initializing) {
    return <div style={{textAlign:"center", marginTop:50}}>Cargando...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  // Si hay usuario, renderiza las rutas hijas
  return <Outlet />;
};

export default RequireAuth;