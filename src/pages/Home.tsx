import React, { useState, useEffect } from 'react';
import html2canvas from "html2canvas";
import { db, auth } from "../firebaseConfig";
import { collection, doc, setDoc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom"; 
import ListaNegocios from "../components/ListaNegocios";

const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const colores = ['#FFB6B9', '#FAE3D9', '#BBDED6', '#8AC6D1', '#FFD3B4', '#FFAAA7', '#D5ECC2'];

interface HomeProps {
  userEmail: string;
}

const Home: React.FC<HomeProps> = ({ userEmail }) => {
  const [tareas, setTareas] = useState<{ [dia: string]: string[] }>({});
  const [nuevaTarea, setNuevaTarea] = useState<{ [dia: string]: string }>({});
  const [animados, setAnimados] = useState<{ [dia: string]: boolean }>({});
  const [mensaje, setMensaje] = useState("");

  // 1) Cargar tareas al montar
  useEffect(() => {
    // ← guard para evitar doc(undefined)
    if (!userEmail) {
      console.warn("No hay userEmail, no cargo tareas");
      return;
    }
    const cargarTareas = async () => {
      const ref = doc(db, "planes", userEmail);
      const snap = await getDoc(ref);
      if (snap.exists()) setTareas(snap.data().tareas || {});
    };
    cargarTareas();
  }, [userEmail]);

  // 2) Guardar tareas al cambiar
  useEffect(() => {
    if (!userEmail) {
      console.warn("No hay userEmail, no guardo tareas");
      return;
    }
    if (Object.keys(tareas).length === 0) return; // evita guardar al cargar
    const guardarTareas = async () => {
      const ref = doc(db, "planes", userEmail);
      await setDoc(ref, { tareas });
    };
    guardarTareas();
  }, [tareas, userEmail]);

  // Resto de tu lógica...
  const handleInputChange = (dia: string, value: string) =>
    setNuevaTarea({ ...nuevaTarea, [dia]: value });

  const agregarTarea = (dia: string) => {
    if (!nuevaTarea[dia]) return;
    setTareas({ ...tareas, [dia]: [...(tareas[dia] || []), nuevaTarea[dia]] });
    setNuevaTarea({ ...nuevaTarea, [dia]: '' });
    setAnimados({ ...animados, [dia]: true });
    setTimeout(() => setAnimados((prev) => ({ ...prev, [dia]: false })), 300);
  };

  const eliminarTarea = (dia: string, index: number) => {
    setTareas({ ...tareas, [dia]: tareas[dia].filter((_, i) => i !== index) });
  };

  // 3) handleGuardar: pon el mismo guard
  const handleGuardar = async () => {
    if (!userEmail) {
      console.warn("No hay userEmail, no guardo en Firestore");
      return;
    }
    const ref = doc(db, "planes", userEmail);
    await setDoc(ref, { tareas });
    setMensaje("¡Planificador guardado en la nube!");

    // creación de imagen...
    const planDiv = document.getElementById("planificador-semanal");
    if (planDiv) {
      const canvas = await html2canvas(planDiv);
      const imgData = canvas.toDataURL("image/png");
      // …
    }
  };

  return (
    <div>
      <ListaNegocios />
      <h1 style={{ /* estilos */ }}>Planificador Semanal</h1>
      {/* …resto de tu UI… */}
      <button onClick={handleGuardar} style={{ /* estilos */ }}>
        Guardar cambios
      </button>
      {mensaje && <div style={{ color: "green" }}>{mensaje}</div>}
    </div>
  );
};

export default Home;