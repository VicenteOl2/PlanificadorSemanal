import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Chip, Typography
} from "@mui/material";

interface Reserva {
  id: string;
  clienteNombre: string;
  clienteEmail: string;
  servicio: string;
  fecha: string;
  hora: string;
  estado: string;
}

const estadoColor = (estado: string) => {
  switch (estado) {
    case "pendiente": return "warning";
    case "confirmada": return "success";
    case "cancelada": return "error";
    default: return "default";
  }
};

const ReservasNegocio: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservas = async () => {
    if (!id) return;
    const q = query(collection(db, "reservas"), where("negocioId", "==", id));
    const querySnapshot = await getDocs(q);
    setReservas(
      querySnapshot.docs.map((docu) => ({ id: docu.id, ...docu.data() } as Reserva))
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchReservas();
    // eslint-disable-next-line
  }, [id]);

  const actualizarEstado = async (reservaId: string, nuevoEstado: string) => {
    const reservaRef = doc(db, "reservas", reservaId);
    await updateDoc(reservaRef, { estado: nuevoEstado });
    fetchReservas();
  };

  if (loading) return <div>Cargando reservas...</div>;
  if (reservas.length === 0) return <Typography>No hay reservas para este negocio.</Typography>;

  return (
    <TableContainer component={Paper} sx={{ maxWidth: 900, margin: "2rem auto" }}>
      <Typography variant="h5" align="center" sx={{ my: 2 }}>Reservas recibidas</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Cliente</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Servicio</TableCell>
            <TableCell>Fecha</TableCell>
            <TableCell>Hora</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reservas.map((reserva) => (
            <TableRow key={reserva.id}>
              <TableCell>{reserva.clienteNombre}</TableCell>
              <TableCell>{reserva.clienteEmail}</TableCell>
              <TableCell>{reserva.servicio}</TableCell>
              <TableCell>{reserva.fecha}</TableCell>
              <TableCell>{reserva.hora}</TableCell>
              <TableCell>
                <Chip label={reserva.estado} color={estadoColor(reserva.estado)} />
              </TableCell>
              <TableCell align="center">
                {reserva.estado === "pendiente" && (
                  <>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      sx={{ mr: 1 }}
                      onClick={() => actualizarEstado(reserva.id, "confirmada")}
                    >
                      Aceptar
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => actualizarEstado(reserva.id, "cancelada")}
                    >
                      Cancelar
                    </Button>
                  </>
                )}
                {reserva.estado === "confirmada" && (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => actualizarEstado(reserva.id, "cancelada")}
                  >
                    Cancelar
                  </Button>
                )}
                {reserva.estado === "cancelada" && (
                  <Typography variant="caption" color="text.secondary">
                    Cancelada
                  </Typography>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ReservasNegocio;