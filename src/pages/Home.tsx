/*ESTA ES LA PAGINA DEL PLANIFICADOR SEMANAL*/
import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Text, Input, Button, SimpleGrid, VStack, HStack, Textarea, List, ListItem,
  Menu, MenuButton, MenuList, MenuItem, IconButton, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, useDisclosure
} from '@chakra-ui/react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { db } from "../firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { Link } from "react-router-dom";
import ListaNegocios from "../components/ListaNegocios";

// ICONOS DE MUI
import SettingsIcon from '@mui/icons-material/Settings';
import StoreMallDirectoryIcon from '@mui/icons-material/StoreMallDirectory';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';

const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

interface Tarea {
  texto: string;
  fecha: string; // formato ISO
}

interface HomeProps {
  userEmail: string;
}

const Home: React.FC<HomeProps> = ({ userEmail }) => {
  const [tareas, setTareas] = useState<{ [dia: string]: Tarea[] }>({});
  const [nuevaTarea, setNuevaTarea] = useState<{ [dia: string]: string }>({});
  const [objetivos, setObjetivos] = useState<{ [semana: string]: string[] }>({});
  const [notas, setNotas] = useState<{ [semana: string]: string }>({});
  const [mensaje, setMensaje] = useState("");
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date());
  const [perfil, setPerfil] = useState({ nombre: "Usuario", email: userEmail });
  const [editando, setEditando] = useState(false);

  // Modales
  const { isOpen, onOpen, onClose } = useDisclosure(); // Negocios
  const perfilModal = useDisclosure(); // Perfil

  // Calcula los días de la semana (de lunes a domingo) para la fecha seleccionada
  function getDiasSemana(fecha: Date) {
    // Lunes = 1, Domingo = 0
    const diaSemana = fecha.getDay() === 0 ? 7 : fecha.getDay();
    const lunes = new Date(fecha);
    lunes.setDate(fecha.getDate() - (diaSemana - 1));
    return dias.map((_, i) => {
      const d = new Date(lunes);
      d.setDate(lunes.getDate() + i);
      return d;
    });
  }

  const diasSemana = getDiasSemana(fechaSeleccionada);
  const semanaClave = diasSemana[0].toISOString().slice(0, 10); // lunes de la semana

  // Cargar tareas y objetivos
  useEffect(() => {
    if (!userEmail) return;
    const cargar = async () => {
      const ref = doc(db, "planes", userEmail);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setTareas(data.tareas || {});
        setObjetivos(data.objetivos || {});
        setNotas(data.notas || {});
      }
    };
    cargar();
  }, [userEmail]);

  // Guardar en Firestore
  const handleGuardar = async () => {
    if (!userEmail) return;
    const ref = doc(db, "planes", userEmail);
    await setDoc(ref, { tareas, objetivos, notas });
    setMensaje("¡Planificador guardado en la nube!");
    setTimeout(() => setMensaje(""), 2000);
  };

  // Manejo de tareas
  const handleInputChange = (dia: string, value: string) =>
    setNuevaTarea({ ...nuevaTarea, [dia]: value });

  const agregarTarea = (dia: string, fechaDia: Date) => {
    if (!nuevaTarea[dia]) return;
    const nueva: Tarea = {
      texto: nuevaTarea[dia],
      fecha: fechaDia.toISOString(),
    };
    setTareas({
      ...tareas,
      [dia]: [...(tareas[dia] || []), nueva],
    });
    setNuevaTarea({ ...nuevaTarea, [dia]: '' });
  };

  const eliminarTarea = (dia: string, index: number) => {
    setTareas({
      ...tareas,
      [dia]: tareas[dia].filter((_, i) => i !== index),
    });
  };

  // Manejo de objetivos por semana
  const handleObjetivoChange = (idx: number, value: string) => {
    const nuevos = [...(objetivos[semanaClave] || ["", "", ""])];
    nuevos[idx] = value;
    setObjetivos({ ...objetivos, [semanaClave]: nuevos });
  };

  // Manejo de notas por semana
  const handleNotaChange = (value: string) => {
    setNotas({ ...notas, [semanaClave]: value });
  };

  // Filtra tareas por día exacto de la semana
  const tareasFiltradas = (dia: string, fechaDia: Date) =>
    (tareas[dia] || []).filter(tarea => {
      const fecha = new Date(tarea.fecha);
      return (
        fecha.getDate() === fechaDia.getDate() &&
        fecha.getMonth() === fechaDia.getMonth() &&
        fecha.getFullYear() === fechaDia.getFullYear()
      );
    });

  // Cerrar sesión real con Firebase Auth
  const handleCerrarSesion = async () => {
    const auth = getAuth();
    await signOut(auth);
    window.location.href = "/login";
  };

  return (
    <Box 
      minH="100vh"
      p={0}
      style={{
        backgroundColor: "#fdf6e3",
        backgroundImage: `
          linear-gradient(to right, #e0e0e0 1px, transparent 1px),
          linear-gradient(to bottom, #e0e0e0 1px, transparent 1px)
        `,
        backgroundSize: "32px 32px",
        overflowX: "hidden"
      }}
    >
      {/* Ruedita de configuración fuera del flujo principal */}
      <Box position="absolute" top="24px" right="24px" zIndex={200}>
        <Menu>
          <MenuButton
            as={IconButton}
      icon={<SettingsIcon />}
      aria-label="Configuración"
      position="absolute"
      top="24px"
      right="24px"
      zIndex={200}
      colorScheme="gray"
      borderRadius="full"
      boxShadow="md"
          />
          <MenuList>
            <MenuItem icon={<StoreMallDirectoryIcon />} onClick={onOpen}>
              Negocios
            </MenuItem>
            <MenuItem icon={<PersonIcon />} onClick={perfilModal.onOpen}>
              Perfil Usuario
            </MenuItem>
            <MenuItem icon={<LogoutIcon />} onClick={handleCerrarSesion}>
              Cerrar sesión
            </MenuItem>
            <MenuItem>
              ¿Quieres implementar tu negocio?{" "}
              <a
                href="mailto:contacto@tusitio.com"
                style={{ color: "#3182ce", marginLeft: 4, textDecoration: "underline" }}
                target="_blank"
                rel="noopener noreferrer"
              >
                Contáctanos
              </a>
            </MenuItem>
          </MenuList>
        </Menu>
      </Box>

      {/* Modal de negocios: muestra la lista dinámica */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Negocios disponibles</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ListaNegocios />
            <Text mt={4} fontSize="sm">
              ¿Quieres implementar tu negocio?{" "}
              <a
                href="mailto:contacto@tusitio.com"
                style={{ color: "#3182ce", textDecoration: "underline" }}
                target="_blank"
                rel="noopener noreferrer"
              >
                Contáctanos
              </a>
            </Text>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal de perfil editable */}
      <Modal isOpen={perfilModal.isOpen} onClose={perfilModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Perfil de Usuario</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editando ? (
              <>
                <Input
                  mb={2}
                  value={perfil.nombre}
                  onChange={e => setPerfil({ ...perfil, nombre: e.target.value })}
                  placeholder="Nombre"
                />
                <Input
                  mb={2}
                  value={perfil.email}
                  onChange={e => setPerfil({ ...perfil, email: e.target.value })}
                  placeholder="Email"
                />
                <Button
                  colorScheme="blue"
                  size="sm"
                  onClick={() => setEditando(false)}
                  mb={2}
                >
                  Guardar
                </Button>
              </>
            ) : (
              <>
                <Text><b>Nombre:</b> {perfil.nombre}</Text>
                <Text><b>Email:</b> {perfil.email}</Text>
                <Button mt={3} colorScheme="blue" size="sm" onClick={() => setEditando(true)}>
                  Editar
                </Button>
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* ...resto del contenido igual... */}
      <Box maxW="1200px" mx="auto" mt={4} p={2}>
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
          {/* Columna izquierda */}
          <VStack align="stretch" spacing={6} minW="260px">
            <Box>
              <Heading size="lg" mb={2}>Planificador semanal</Heading>
              <Text fontSize="md" color="gray.600" mb={2}>Mes:</Text>
              <Box borderRadius="md" p={2} mb={4} bg="white">
                <Calendar
                  onChange={(value) => {
                    if (value && !Array.isArray(value)) {
                      setFechaSeleccionada(value);
                    }
                  }}
                  value={fechaSeleccionada}
                  view="month"
                  calendarType="iso8601"
                  showNeighboringMonth={false}
                />
              </Box>
            </Box>
            <Box>
              <Text fontWeight="bold" mb={1}>Objetivos</Text>
              <VStack align="stretch" spacing={1}>
                {(objetivos[semanaClave] || ["", "", ""]).map((obj, i) => (
                  <Input
                    key={i}
                    placeholder={`${i + 1}.`}
                    value={obj}
                    onChange={e => handleObjetivoChange(i, e.target.value)}
                    size="sm"
                    bg="rgba(255,255,255,0.85)"
                    borderRadius="10px"
                    border="2px dashed #bdbdbd"
                    style={{ fontFamily: "'Indie Flower', cursive" }}
                  />
                ))}
              </VStack>
            </Box>
            <Box>
              <Text fontWeight="bold" mb={1}>A tener en cuenta</Text>
              <Textarea
                value={notas[semanaClave] || ""}
                onChange={e => handleNotaChange(e.target.value)}
                placeholder="..."
                size="sm"
                minH="60px"
                bg="rgba(255,255,255,0.85)"
                borderRadius="10px"
                border="2px dashed #bdbdbd"
                style={{ fontFamily: "'Indie Flower', cursive" }}
              />
            </Box>
          </VStack>
          {/* Columna derecha: días de la semana */}
          <Box gridColumn={{ md: "span 3" }}>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={4}>
              {/* Primeros 3 días (Lunes a Miércoles) */}
              {dias.slice(0, 3).map((dia, idx) => (
                <Box
                  key={dia}
                  bg="rgba(255,255,255,0.92)"
                  borderRadius="18px"
                  border="2px dashed #bdbdbd"
                  boxShadow="0 2px 8px 0 rgba(0,0,0,0.04)"
                  p={3}
                  minH="220px"
                  style={{
                    backdropFilter: "blur(1px)",
                    transition: "box-shadow 0.2s",
                  }}
                  _hover={{
                    boxShadow: "0 4px 16px 0 rgba(0,0,0,0.10)",
                    borderColor: "#90caf9"
                  }}
                >
                  <Text
                    fontWeight="bold"
                    fontSize="lg"
                    mb={2}
                    style={{ fontFamily: "'Indie Flower', cursive" }}
                  >
                    {dia} <Box as="span" color="gray.500" fontWeight="normal">{diasSemana[idx].getDate()}</Box>
                  </Text>
                  <List spacing={1} mb={2}>
                    {tareasFiltradas(dia, diasSemana[idx]).map((tarea, i) => (
                      <ListItem key={i} display="flex" alignItems="center">
                        <Text
                          flex="1"
                          color="#222"
                          style={{
                            fontFamily: "'Permanent Marker', cursive",
                            fontSize: "1.1em",
                            letterSpacing: "0.5px",
                            transform: "rotate(-1deg)",
                            lineHeight: 1.3,
                          }}
                        >
                          {tarea.texto}
                        </Text>
                        <Button
                          size="xs"
                          colorScheme="red"
                          ml={2}
                          onClick={() => eliminarTarea(dia, i)}
                        >×</Button>
                      </ListItem>
                    ))}
                  </List>
                  <HStack>
                    <Input
                      size="sm"
                      placeholder="Nueva tarea"
                      value={nuevaTarea[dia] || ""}
                      onChange={e => handleInputChange(dia, e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") agregarTarea(dia, diasSemana[idx]); }}
                      bg="white"
                      borderRadius="10px"
                    />
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => agregarTarea(dia, diasSemana[idx])}
                    >+</Button>
                  </HStack>
                </Box>
              ))}
            </SimpleGrid>
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
              {/* Siguientes 4 días (Jueves a Domingo) */}
              {dias.slice(3).map((dia, idx) => (
                <Box
                  key={dia}
                  bg="rgba(255,255,255,0.92)"
                  borderRadius="18px"
                  border="2px dashed #bdbdbd"
                  boxShadow="0 2px 8px 0 rgba(0,0,0,0.04)"
                  p={3}
                  minH="220px"
                  style={{
                    backdropFilter: "blur(1px)",
                    transition: "box-shadow 0.2s",
                  }}
                  _hover={{
                    boxShadow: "0 4px 16px 0 rgba(0,0,0,0.10)",
                    borderColor: "#90caf9"
                  }}
                >
                  <Text
                    fontWeight="bold"
                    fontSize="lg"
                    mb={2}
                    style={{ fontFamily: "'Indie Flower', cursive" }}
                  >
                    {dia} <Box as="span" color="gray.500" fontWeight="normal">{diasSemana[idx + 3].getDate()}</Box>
                  </Text>
                  <List spacing={1} mb={2}>
                    {tareasFiltradas(dia, diasSemana[idx + 3]).map((tarea, i) => (
                      <ListItem key={i} display="flex" alignItems="center">
                        <Text
                          flex="1"
                          color="#222"
                          style={{
                            fontFamily: "'Permanent Marker', cursive",
                            fontSize: "1.1em",
                            letterSpacing: "0.5px",
                            transform: "rotate(-1deg)",
                            lineHeight: 1.3,
                          }}
                        >
                          {tarea.texto}
                        </Text>
                        <Button
                          size="xs"
                          colorScheme="red"
                          ml={2}
                          onClick={() => eliminarTarea(dia, i)}
                        >×</Button>
                      </ListItem>
                    ))}
                  </List>
                  <HStack>
                    <Input
                      size="sm"
                      placeholder="Nueva tarea"
                      value={nuevaTarea[dia] || ""}
                      onChange={e => handleInputChange(dia, e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") agregarTarea(dia, diasSemana[idx + 3]); }}
                      bg="white"
                      borderRadius="10px"
                    />
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => agregarTarea(dia, diasSemana[idx + 3])}
                    >+</Button>
                  </HStack>
                </Box>
              ))}
            </SimpleGrid>
            <Button
              mt={6}
              colorScheme="green"
              w="100%"
              maxW="320px"
              mx="auto"
              display="block"
              onClick={handleGuardar}
            >
              Guardar cambios
            </Button>
            {mensaje && (
              <Text mt={4} textAlign="center" color="green.500">{mensaje}</Text>
            )}
          </Box>
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default Home;