import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Button,
  SimpleGrid,
  Textarea,
  VStack,
  Text,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";

const diasSemana = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const CalendarioMensual = () => {
  const [mes, setMes] = useState(new Date().getMonth());
  const [anio, setAnio] = useState(new Date().getFullYear());
  const navigate = useNavigate();

  // Persistencia de notas y "no olvidar" por mes
  const notasKey = `notasMensuales_${anio}_${mes}`;
  const noOlvidarKey = `noOlvidarMensual_${anio}_${mes}`;
  const [notas, setNotas] = useState(() => localStorage.getItem(notasKey) || "");
  const [noOlvidar, setNoOlvidar] = useState(() => localStorage.getItem(noOlvidarKey) || "");

  // Actualiza notas y noOlvidar al cambiar mes/año
  useEffect(() => {
    setNotas(localStorage.getItem(notasKey) || "");
    setNoOlvidar(localStorage.getItem(noOlvidarKey) || "");
    // eslint-disable-next-line
  }, [anio, mes]);

  useEffect(() => {
    localStorage.setItem(notasKey, notas);
  }, [notas, notasKey]);

  useEffect(() => {
    localStorage.setItem(noOlvidarKey, noOlvidar);
  }, [noOlvidar, noOlvidarKey]);

  // Tareas desde localStorage
  const tareas = JSON.parse(localStorage.getItem("tareas") || "[]");
  const tareasArray = Array.isArray(tareas) ? tareas : Object.values(tareas);
  const tareasPorDia: { [fecha: string]: string[] } = {};

  tareasArray.forEach((tarea: { fecha?: string; texto?: string; title?: string }) => {
    if (!tarea.fecha) return;
    const fechaStr = tarea.fecha.slice(0, 10);
    if (!tareasPorDia[fechaStr]) tareasPorDia[fechaStr] = [];
    const texto = tarea.title || tarea.texto;
    if (texto) {
      tareasPorDia[fechaStr].push(texto);
    }
  });

  // Calcula los días del mes
  const primerDia = new Date(anio, mes, 1);
  const ultimoDia = new Date(anio, mes + 1, 0);
  const diasEnMes = ultimoDia.getDate();

  // Para alinear el primer día (lunes a domingo)
  const primerDiaSemana = (primerDia.getDay() + 6) % 7; // 0 = lunes

  // Navegación de meses
  const handleMesAnterior = () => {
    if (mes === 0) {
      setMes(11);
      setAnio(anio - 1);
    } else {
      setMes(mes - 1);
    }
  };
  const handleMesSiguiente = () => {
    if (mes === 11) {
      setMes(0);
      setAnio(anio + 1);
    } else {
      setMes(mes + 1);
    }
  };

  return (
    <Box maxW="900px" mx="auto" mt={6} p={4}>
      <Heading mb={4}>Calendario mensual</Heading>
      <Button mb={4} onClick={() => navigate("/home")}>
        Volver al planificador semanal
      </Button>
      <HStack mb={4} align="center">
        <IconButton
          aria-label="Mes anterior"
          icon={<ChevronLeftIcon />}
          size="sm"
          onClick={handleMesAnterior}
        />
        <Heading size="md" mx={2}>
          {new Date(anio, mes).toLocaleString("es-ES", {
            month: "long",
            year: "numeric",
          }).toUpperCase()}
        </Heading>
        <IconButton
          aria-label="Mes siguiente"
          icon={<ChevronRightIcon />}
          size="sm"
          onClick={handleMesSiguiente}
        />
      </HStack>
      <SimpleGrid columns={7} spacing={2} mb={2}>
        {diasSemana.map((dia) => (
          <Box key={dia} fontWeight="bold" textAlign="center">
            {dia}
          </Box>
        ))}
      </SimpleGrid>
      <SimpleGrid columns={7} spacing={2}>
        {[...Array(primerDiaSemana)].map((_, i) => (
          <Box key={`empty-${i}`} />
        ))}
        {[...Array(diasEnMes)].map((_, i) => {
          const fecha = new Date(anio, mes, i + 1);
          const fechaStr = fecha.toISOString().slice(0, 10);
          return (
            <Box
              key={fechaStr}
              border="1px solid #ddd"
              minH="60px"
              p={1}
              borderRadius="md"
              bg="white"
            >
              <Text fontSize="sm" fontWeight="bold">
                {i + 1}
              </Text>
              {(tareasPorDia[fechaStr] || []).map((t, idx) => (
                <Text key={idx} fontSize="xs" color="purple.700" isTruncated>
                  • {t}
                </Text>
              ))}
            </Box>
          );
        })}
      </SimpleGrid>
      <VStack align="stretch" mt={6} spacing={3}>
        <Box>
          <Text fontWeight="bold" mb={1}>
            No olvidar
          </Text>
          <Textarea
            value={noOlvidar}
            onChange={(e) => setNoOlvidar(e.target.value)}
            placeholder="Escribe aquí tus recordatorios importantes del mes..."
          />
        </Box>
        <Box>
          <Text fontWeight="bold" mb={1}>
            Notas
          </Text>
          <Textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Notas generales del mes..."
          />
        </Box>
      </VStack>
    </Box>
  );
};

export default CalendarioMensual;