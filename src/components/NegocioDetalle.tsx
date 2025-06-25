import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc, collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import emailjs from "emailjs-com";
import {
  TextField, Button, MenuItem, Typography, Box, Paper
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";

interface Negocio {
  Nombre: string;
  "Logo URL"?: string;
  Servicios: string[];
  horariosDisponibles: {
    [dia: string]: string[];
  };
}

const NegocioDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [loading, setLoading] = useState(true);

  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");
  const [servicio, setServicio] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const fetchNegocio = async () => {
      if (!id) return;
      const ref = doc(db, "Negocios", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setNegocio(snap.data() as Negocio);
      }
      setLoading(false);
    };
    fetchNegocio();
  }, [id]);

  const enviarEmailConfirmacion = (
    nombre: string,
    email: string,
    servicio: string,
    fecha: string,
    hora: string
  ) => {
    emailjs.send(
      "service_zorfhzp",
      "template_9v1ktik",
      { name: nombre, servicio, fecha, hora, to_email: email },
      "VyQXV4DoOxHTLr09A"
    );
  };

  const handleReserva = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");
    if (!clienteNombre || !clienteEmail || !servicio || !fecha || !hora) {
      setMensaje("Completa todos los campos.");
      return;
    }
    try {
      const reservasRef = collection(db, "reservas");
      const q = query(
        reservasRef,
        where("negocioId", "==", id),
        where("fecha", "==", fecha),
        where("hora", "==", hora),
        where("estado", "in", ["pendiente", "confirmada"])
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setMensaje("Ya existe una reserva para ese horario. Elige otro.");
        return;
      }

      await addDoc(reservasRef, {
        negocioId: id,
        clienteNombre,
        clienteEmail,
        servicio,
        fecha,
        hora,
        estado: "pendiente"
      });

      enviarEmailConfirmacion(clienteNombre, clienteEmail, servicio, fecha, hora);

      setMensaje("¡Reserva realizada con éxito!");
      setClienteNombre("");
      setClienteEmail("");
      setServicio("");
      setFecha("");
      setHora("");
    } catch (error) {
      setMensaje("Error al guardar la reserva.");
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (!negocio) return <div>Por favor busca un negocio registrado.</div>;

  const muiTheme = createTheme();

  return (
    <Paper elevation={3} sx={{ maxWidth: 600, margin: "2rem auto", padding: 4, borderRadius: 3 }}>
      {negocio["Logo URL"] && (
        <img
          src={negocio["Logo URL"]}
          alt={negocio.Nombre}
          style={{ maxWidth: 120, display: "block", margin: "0 auto 1rem" }}
        />
      )}
      <Typography variant="h4" align="center" gutterBottom>
        {negocio.Nombre}
      </Typography>

      <Typography variant="h6" gutterBottom>Servicios</Typography>
      <ul>
        {negocio.Servicios.map((servicio, idx) => (
          <li key={idx}>{servicio}</li>
        ))}
      </ul>

      <Typography variant="h6" gutterBottom>Horarios Disponibles</Typography>
      <ul>
        {Object.entries(negocio.horariosDisponibles || {}).map(([dia, horarios]) => (
          <li key={dia}>
            <strong>{dia}:</strong> {horarios.length > 0 ? horarios.join(", ") : "No disponible"}
          </li>
        ))}
      </ul>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Reservar turno
      </Typography>

      <ThemeProvider theme={muiTheme}>
        <Box component="form" onSubmit={handleReserva} sx={{ mt: 2 }}>
          <TextField
            label="Tu nombre"
            value={clienteNombre}
            onChange={e => setClienteNombre(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Tu email"
            value={clienteEmail}
            onChange={e => setClienteEmail(e.target.value)}
            fullWidth
            margin="normal"
            type="email"
          />
          <TextField
            select
            label="Servicio"
            value={servicio}
            onChange={e => setServicio(e.target.value)}
            fullWidth
            margin="normal"
          >
            {negocio.Servicios.map((s, idx) => (
              <MenuItem key={idx} value={s}>{s}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Fecha"
            type="date"
            value={fecha}
            onChange={e => setFecha(e.target.value)}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: new Date().toISOString().split("T")[0] }}
          />
          <TextField
            select
            label="Hora"
            value={hora}
            onChange={e => setHora(e.target.value)}
            fullWidth
            margin="normal"
            disabled={!fecha}
          >
            <MenuItem value="">Selecciona una hora</MenuItem>
            {fecha ? (() => {
              const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
              const diaSemana = dias[new Date(fecha).getDay()];
              const horasDisponibles = negocio.horariosDisponibles[diaSemana] || [];
              if (horasDisponibles.length === 0) {
                return (
                  <MenuItem value="" disabled>
                    No hay horas disponibles
                  </MenuItem>
                );
              }
              return horasDisponibles.map((h, idx) => (
                <MenuItem key={idx} value={h}>{h}</MenuItem>
              ));
            })() : null}
          </TextField>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Reservar
          </Button>
          {mensaje && (
            <Typography sx={{ mt: 2 }} color={mensaje.startsWith("¡") ? "success.main" : "error.main"}>
              {mensaje}
            </Typography>
          )}
        </Box>
      </ThemeProvider>

      <Link to={`/negocio/${id}/reservas`} style={{ display: "block", marginTop: 24, textAlign: "center" }}>
        Ver reservas de este negocio
      </Link>
    </Paper>
  );
};

export default NegocioDetalle;