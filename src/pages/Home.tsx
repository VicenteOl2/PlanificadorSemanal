import React, { useState } from 'react';
import html2canvas from "html2canvas";

const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const colores = [
  '#FFB6B9', '#FAE3D9', '#BBDED6', '#8AC6D1', '#FFD3B4', '#FFAAA7', '#D5ECC2'
];

const Home: React.FC<{ userEmail: string }> = ({ userEmail }) => {
  const [tareas, setTareas] = useState<{ [dia: string]: string[] }>({});
  const [nuevaTarea, setNuevaTarea] = useState<{ [dia: string]: string }>({});
  const [animados, setAnimados] = useState<{ [dia: string]: boolean }>({});
  const [mensaje, setMensaje] = useState("");

  const handleInputChange = (dia: string, value: string) => setNuevaTarea({ ...nuevaTarea, [dia]: value });

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

  // GUARDAR COMO IMAGEN Y SIMULAR ENVÍO
  const handleGuardar = async () => {
    const planDiv = document.getElementById("planificador-semanal");
    if (planDiv) {
      const canvas = await html2canvas(planDiv);
      const imgData = canvas.toDataURL("image/png");
      setMensaje("¡Planificador guardado! (Aquí se enviaría por correo a " + userEmail + ")");
      // Aquí podrías enviar imgData a un backend o usar EmailJS
    }
  };

  return (
    <div>
      <style>{/* ...tus estilos aquí... */}</style>
      <h1 style={{ textAlign: 'center', color: '#ffb347', marginBottom: 30, letterSpacing: 2, textShadow: '2px 2px 8px #000' }}>Planificador Semanal</h1>
      <div id="planificador-semanal" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {dias.map((dia, i) => (
          <div key={dia} className="card-dia" style={{
            background: colores[i],
            padding: '16px',
            borderRadius: '14px',
            minWidth: '220px',
            marginBottom: '20px',
            border: 'none',
            opacity: 0.93,
          }}>
            <h2 style={{ color: '#444', textAlign: 'center', marginBottom: 10 }}>{dia}</h2>
            <ul style={{ minHeight: 40, paddingLeft: 0 }}>
              {(tareas[dia] || []).map((tarea, idx) => (
                <li key={idx} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'rgba(255,255,255,0.7)', borderRadius: 6, padding: '4px 8px', marginBottom: 6,
                }}>
                  <span style={{ color: '#333' }}>{tarea}</span>
                  <button className="eliminar-btn" onClick={() => eliminarTarea(dia, idx)}>✕</button>
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
              <input
                className="input-tarea"
                type="text"
                placeholder={`Agregar tarea para ${dia}`}
                value={nuevaTarea[dia] || ''}
                onChange={(e) => handleInputChange(dia, e.target.value)}
                style={{ width: '70%' }}
              />
              <button
                className={`boton-agregar${animados[dia] ? ' animado' : ''}`}
                onClick={() => agregarTarea(dia)}
                style={{ marginLeft: '8px' }}
              >
                Agregar
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={handleGuardar}
        style={{
          display: "block",
          margin: "30px auto 0 auto",
          padding: "12px 32px",
          background: "#ffb347",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontWeight: "bold",
          fontSize: "18px",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(255, 179, 71, 0.2)",
        }}
      >
        Guardar cambios
      </button>
      {mensaje && <div style={{ textAlign: "center", color: "green", marginTop: 10 }}>{mensaje}</div>}
    </div>
  );
};

export default Home;