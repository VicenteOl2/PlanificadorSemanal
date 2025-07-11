/*ESTA ES LA PAGINA DEL PLANIFICADOR SEMANAL*/
import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Text, Input, Button, SimpleGrid, VStack, HStack, Textarea, List, ListItem,
  Menu, MenuButton, MenuList, MenuItem, IconButton, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, useDisclosure, Spinner, Tooltip, Select
} from '@chakra-ui/react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { db } from "../firebaseConfig";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { getAuth, signOut, onAuthStateChanged, User, updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import ListaNegocios from "../components/ListaNegocios";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebaseConfig";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import StoreMallDirectoryIcon from '@mui/icons-material/StoreMallDirectory';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import PaletteIcon from '@mui/icons-material/Palette';
import { nanoid } from "nanoid";
import { dias, Tarea, horasDelDia } from "../utils/planificador";
import TareaItem from "../components/Tarea";
import AlarmIcon from '@mui/icons-material/Alarm';
import Collaborate, { usePresenciaColaborativa } from "../components/Collaborate";
import Alarm from "../components/Alarm";

const Home = () => {
  // --- ESTADOS ---
  const [tareas, setTareas] = useState<{ [dia: string]: Tarea[] }>({});
  const [nuevaTarea, setNuevaTarea] = useState<{ [dia: string]: string }>({});
  const [objetivos, setObjetivos] = useState<{ [semana: string]: string[] }>({});
  const [notas, setNotas] = useState<{ [semana: string]: string }>({});
  const [mensaje, setMensaje] = useState("");
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date());
  const [perfil, setPerfil] = useState<{ nombre: string; email: string }>({ nombre: "Usuario", email: "" });
  const [editando, setEditando] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user] = useAuthState(auth);
  const [colorTarea, setColorTarea] = useState<{ [dia: string]: string }>({});
 
  const [paleta, setPaleta] = useState([
    { nombre: "Importante", color: "#e53935" },
    { nombre: "Casa", color: "#1e88e5" },
    { nombre: "Gimnasio", color: "#fbc02d" },
    { nombre: "Salud", color: "#43a047" },
  ]);
  const [semanaSeleccionadaInput, setSemanaSeleccionadaInput] = useState("");
  const [semanaColaborativa, setSemanaColaborativa] = useState<string | null>(
    localStorage.getItem("semanaColaborativa")
  );
  const [modoColaborativo, setModoColaborativo] = useState<boolean>(!!semanaColaborativa);
  const [cargandoModo, setCargandoModo] = useState(false);
  const [errorColaboracion, setErrorColaboracion] = useState(false);
  const [codigoInput, setCodigoInput] = useState(""); // Para unirse a una semana
  const [nuevoColor, setNuevoColor] = useState("#e53935");
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [alarmaModal, setAlarmaModal] = useState<{ abierto: boolean; dia?: string; tarea?: Tarea; hora?: string }>({ abierto: false });
  const colaboracionModal = useDisclosure(); // <-- Modal de colaboración

  // --- PRESENCIA EN TIEMPO REAL ---
  const { escribiendo, setPresencia } = usePresenciaColaborativa({
    semanaColaborativa,
    userEmail,
    db
  });

  // --- MODALES ---
  const { isOpen, onOpen, onClose } = useDisclosure(); // Negocios
  const perfilModal = useDisclosure(); // Perfil
  const paletaModal = useDisclosure(); // Paleta
  const navigate = useNavigate();

  // --- FUNCIONES PARA MODAL DE ALARMA ---
  const abrirModalAlarma = (dia: string, tarea: Tarea) => {
    setAlarmaModal({ abierto: true, dia, tarea, hora: tarea.hora || "" });
  };
  const cerrarModalAlarma = () => {
    setAlarmaModal({ abierto: false });
  };

  // Sincroniza semanaColaborativa con localStorage
  useEffect(() => {
    if (semanaColaborativa) {
      localStorage.setItem("semanaColaborativa", semanaColaborativa);
    } else {
      localStorage.removeItem("semanaColaborativa");
    }
  }, [semanaColaborativa]);

  // --- EFECTOS ---
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user && user.email) {
        setUserEmail(user.email);
        setPerfil(prev => ({
          ...prev,
          email: user.email!,
          nombre: user.displayName || "Usuario",
        }));
      } else {
        localStorage.removeItem("semanaColaborativa");
        setSemanaColaborativa(null);
        setUserEmail(null);
        setPerfil(prev => ({ ...prev, email: "" }));
        navigate("/login");
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line
  }, []);

  // --- FUNCIONES AUXILIARES ---
  function getLunes(fecha: Date): Date {
    const d = new Date(fecha);
    const day = d.getDay();
    // Si es domingo (0), retrocede 6 días; si es lunes (1), retrocede 0 días, etc.
    const diff = d.getDate() - ((day + 6) % 7);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function getDiasSemana(lunes: Date) {
    // Devuelve los 7 días de la semana a partir del lunes dado
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(lunes);
      d.setDate(lunes.getDate() + i);
      return d;
    });
  }
  const lunes = getLunes(fechaSeleccionada);
  const diasSemana = getDiasSemana(lunes);
  const semanaClave = lunes.toISOString().slice(0, 10);

  // --- Colaboraciones recientes ---
  function agregarColaboracionReciente(id: string) {
    const key = "colaboracionesRecientes";
    let recientes = JSON.parse(localStorage.getItem(key) || "[]");
    if (!recientes.includes(id)) {
      recientes.unshift(id);
      if (recientes.length > 5) recientes = recientes.slice(0, 5); // Máximo 5
      localStorage.setItem(key, JSON.stringify(recientes));
    }
  }

  function obtenerColaboracionesRecientes(): string[] {
    return JSON.parse(localStorage.getItem("colaboracionesRecientes") || "[]");
  }

  // --- EFECTO PRINCIPAL DE CARGA ---
  useEffect(() => {
    // Si hay error de colaboración, NO intentes cargar nada más
    if (errorColaboracion) {
      setLoading(false);
      setCargandoModo(false);
      return;
    }
    if (!userEmail && !semanaColaborativa) {
      setLoading(false);
      setCargandoModo(false);
      return;
    }
    if (!userEmail && semanaColaborativa === null) {
      setLoading(false);
      setCargandoModo(false);
      return;
    }
    setLoading(true);

    const ref = semanaColaborativa
      ? doc(db, "semanas", semanaColaborativa)
      : doc(db, "planes", userEmail!);

    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setTareas(data.tareas || {});
        setObjetivos(data.objetivos || {});
        setNotas(data.notas || {});
      } else {
        setTareas({});
        setObjetivos({});
        setNotas({});
        // Si es colaborativo y no existe, muestra mensaje y bloquea recarga
        if (semanaColaborativa) {
          setMensaje("La colaboración no existe o fue eliminada.");
          setSemanaColaborativa(null);
          localStorage.removeItem("semanaColaborativa");
          setErrorColaboracion(true); // <-- Marca el error y bloquea recarga
        }
      }
      setLoading(false);
      setCargandoModo(false);
    }, (error) => {
      setLoading(false);
      setCargandoModo(false);
      setMensaje("Error al cargar datos de Firestore. Revisa la consola.");
      setErrorColaboracion(true);
      console.error("Error al cargar datos de Firestore:", error);
    });

    return () => unsubscribe();
  }, [userEmail, semanaColaborativa, errorColaboracion]);

  // --- GUARDAR EN FIRESTORE ---
  const handleGuardar = async () => {
    const ref = semanaColaborativa
      ? doc(db, "semanas", semanaColaborativa)
      : doc(db, "planes", userEmail!);
    try {
      await setDoc(ref, { tareas, objetivos, notas }, { merge: true });
      setMensaje("¡Planificador guardado en la nube!");
      setTimeout(() => setMensaje(""), 2000);
    } catch (error) {
      setMensaje("Error al guardar en la nube. Revisa la consola.");
      setTimeout(() => setMensaje(""), 4000);
      console.error("Error al guardar en Firestore:", error);
      alert("Error al guardar en Firestore: " + (error as any)?.message);
    }
  };

  // --- GUARDADO AUTOMÁTICO DE TAREAS ---
  useEffect(() => {
    if (tareas && Object.keys(tareas).length > 0) {
      handleGuardar();
    }
    // eslint-disable-next-line
  }, [tareas]);

  // --- GUARDAR PERFIL ---
  const handleGuardarPerfil = async () => {
    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, {
          displayName: perfil.nombre,
        });
        setEditando(false);
        perfilModal.onClose();
        setPerfil(prev => ({
          ...prev,
          nombre: perfil.nombre,
        }));
      } catch (error) {
        alert("Error al actualizar el nombre");
      }
    }
  };

  // --- MANEJO DE TAREAS ---
  const handleInputChange = (dia: string, value: string) => {
    setNuevaTarea({ ...nuevaTarea, [dia]: value });
    setPresencia(dia, value);
  };

  const handleInputBlur = (dia: string) => {
    setPresencia(dia, "");
  };

  const agregarTarea = (dia: string, fechaDia: Date) => {
    if (!nuevaTarea[dia]) return;
    const nueva: Tarea = {
      texto: nuevaTarea[dia],
      fecha: fechaDia.toISOString(),
      completada: false,
      color: colorTarea[dia] || paleta[0].color
    };
    const nuevasTareas = {
      ...tareas,
      [dia]: [...(tareas[dia] || []), nueva],
    };
    setTareas(nuevasTareas);
    setNuevaTarea({ ...nuevaTarea, [dia]: '' });
    setPresencia(dia, "");
  };

  const toggleTareaCompletada = (dia: string, idx: number) => {
    const nuevasTareas = {
      ...tareas,
      [dia]: tareas[dia].map((t, i) =>
        i === idx ? { ...t, completada: !t.completada } : t
      ),
    };
    setTareas(nuevasTareas);
  };

  const eliminarTarea = (dia: string, index: number) => {
    const nuevasTareas = {
      ...tareas,
      [dia]: tareas[dia].filter((_, i) => i !== index),
    };
    setTareas(nuevasTareas);
  };

  // --- MANEJO DE OBJETIVOS Y NOTAS ---
  const handleObjetivoChange = (idx: number, value: string) => {
    const nuevos = [...(objetivos[semanaClave] || ["", "", ""])];
    nuevos[idx] = value;
    setObjetivos({ ...objetivos, [semanaClave]: nuevos });
  };

  const handleNotaChange = (value: string) => {
    setNotas({ ...notas, [semanaClave]: value });
  };

  // --- FILTRAR TAREAS POR DÍA ---
  const tareasFiltradas = (dia: string, fechaDia: Date) =>
    (tareas[dia] || []).filter(tarea => {
      const fecha = new Date(tarea.fecha);
      return (
        fecha.getDate() === fechaDia.getDate() &&
        fecha.getMonth() === fechaDia.getMonth() &&
        fecha.getFullYear() === fechaDia.getFullYear()
      );
    });

  // --- CERRAR SESIÓN ---
  const handleCerrarSesion = async () => {
    localStorage.removeItem("semanaColaborativa");
    setSemanaColaborativa(null);
    await signOut(auth);
    window.location.href = "/login";
  };

  // --- RETURN ---
  return (
    <Box minH="100vh" p={0} style={{
      backgroundColor: "#fdf8e4",
      backgroundImage: `
        linear-gradient(to right, #e0e0e0 1px, transparent 1px),
        linear-gradient(to bottom, #e0e0e0 1px, transparent 1px)
      `,
      backgroundSize: "32px 32px",
      overflowX: "hidden"
    }}>
      <Box maxW="1200px" mx="auto" mt={4} p={2} position="relative">
        {/* Barra superior con título y menú */}
        <HStack justify="space-between" align="center" mb={4}>
          <HStack>
            <Heading size="lg" mb={0}>
              {semanaColaborativa ? "Planificador semanal colaborativo" : "Planificador semanal"}
            </Heading>
         <Button
  size="sm"
  colorScheme={semanaColaborativa ? "teal" : "gray"}
  variant={semanaColaborativa ? "solid" : "outline"}
  ml={4}
  onClick={() => {
    setCargandoModo(true);
    setErrorColaboracion(false);
    if (semanaColaborativa) {
      setSemanaColaborativa(null);
      setMensaje("Has vuelto a tu planificador personal.");
    } else {
      const colab = localStorage.getItem("semanaColaborativa");
      if (colab) {
        setSemanaColaborativa(colab);
        setMensaje("Has cambiado al planificador colaborativo.");
      } else {
        setMensaje("No tienes colaboración activa. Únete o crea una desde el menú.");
        colaboracionModal.onOpen(); // <-- Abre el modal para ingresar/cambiar código
        setCargandoModo(false); // Detén el spinner si no hay colaboración
        return;
      }
    }
    setTimeout(() => setMensaje(""), 2000);
  }}
>
  {semanaColaborativa ? "Ver mi planificador personal" : "Ver planificador colaborativo"}
</Button>
            <Tooltip label="Aquí puedes crear y personalizar tu paleta de colores para clasificar tus tareas por grupos o importancia." fontSize="sm" hasArrow>
              <span style={{ cursor: "pointer", marginLeft: 6 }}>
                <HelpOutlineIcon fontSize="small" style={{ borderRadius: "50%", background: "#eee", color: "#555" }} />
              </span>
            </Tooltip>
            <IconButton
              aria-label="Editar paleta de colores"
              icon={<PaletteIcon />}
              size="sm"
              ml={2}
              onClick={paletaModal.onOpen}
              variant="ghost"
            />
          </HStack>
          {user && (
            <Box
              bg="whiteAlpha.800"
              px={4}
              py={2}
              borderRadius="md"
              boxShadow="md"
              fontWeight="bold"
              color="teal.700"
              fontSize="md"
            >
              {user.displayName || user.email}
            </Box>
          )}
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<SettingsIcon />}
              aria-label="Configuración"
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
              <MenuItem icon={<PaletteIcon />} onClick={paletaModal.onOpen}>
                Paleta de colores
              </MenuItem>
              <MenuItem icon={<SettingsIcon />} onClick={colaboracionModal.onOpen}>
                Colaboración semanal
              </MenuItem>
              <MenuItem icon={<LogoutIcon />} onClick={handleCerrarSesion}>
                Cerrar sesión
              </MenuItem>
              <MenuItem>
                ¿Quieres implementar tu negocio?{" "}
                <a
                  href="mailto:VicWebCraft@gmail.com"
                  style={{ color: "#3182ce", marginLeft: 4, textDecoration: "underline" }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contáctanos
                </a>
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>

        {/* Modal de colaboración */}
        <Modal isOpen={colaboracionModal.isOpen} onClose={colaboracionModal.onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Colaboración semanal</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {/* Calendario visual para elegir la semana */}
              <VStack mb={4} spacing={3}>
                <Text fontWeight="bold">Selecciona la semana a colaborar:</Text>
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
                <Text fontSize="sm" color="gray.600" mt={2}>
                  Selecciona cualquier día y el planificador mostrará la semana correspondiente.
                </Text>
              </VStack>
              {/* Colaboraciones recientes */}
              {obtenerColaboracionesRecientes().length > 0 && (
                <Box mb={3}>
                  <Text fontSize="sm" color="gray.600" mb={1}>Colaboraciones recientes:</Text>
                  {obtenerColaboracionesRecientes().map(id => (
                    <Button
                      key={id}
                      size="xs"
                      variant="outline"
                      colorScheme="teal"
                      mr={2}
                      mb={1}
                      onClick={() => {
                        setSemanaColaborativa(id);
                        setMensaje(`Has vuelto a la colaboración ${id.split("_")[0]}`);
                        colaboracionModal.onClose();
                      }}
                    >
                      {id}
                    </Button>
                  ))}
                </Box>
              )}
              {/* Confirmación de semana seleccionada */}
              <Box mb={3} p={2} bg="teal.50" borderRadius="md" border="1px solid #b2f5ea">
                <Text fontWeight="bold" color="teal.700">
                  Estás colaborando en la semana del{" "}
                  <b>
                    {diasSemana[0].toLocaleDateString()} al {diasSemana[6].toLocaleDateString()}
                  </b>
                </Text>
              </Box>
              {/* Colaboración (ahora componente separado) */}
              <Collaborate
                semanaColaborativa={semanaColaborativa}
                setSemanaColaborativa={id => {
                  setSemanaColaborativa(id);
                  if (id) agregarColaboracionReciente(id);
                }}
                codigoInput={codigoInput}
                setCodigoInput={setCodigoInput}
                mensaje={mensaje}
                setMensaje={setMensaje}
                diasSemana={diasSemana}
                userEmail={userEmail}
                nanoid={nanoid}
                db={db}
                doc={doc}
                setDoc={setDoc}
                getDoc={getDoc}
              />
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Modal para personalizar paleta */}
        <Modal isOpen={paletaModal.isOpen} onClose={paletaModal.onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Personaliza tu paleta de colores</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text mb={1}>Color:</Text>
                  <Input
                    type="color"
                    value={nuevoColor}
                    onChange={e => setNuevoColor(e.target.value)}
                    width="50px"
                    height="50px"
                    p={0}
                    border="none"
                    bg="transparent"
                  />
                </Box>
                <Box>
                  <Text mb={1}>Nombre:</Text>
                  <Input
                    value={nuevoNombre}
                    onChange={e => setNuevoNombre(e.target.value)}
                    placeholder="Ej: Importante, Casa, etc."
                  />
                </Box>
                <Button
                  colorScheme="teal"
                  onClick={() => {
                    if (!nuevoNombre.trim()) return;
                    setPaleta([...paleta, { nombre: nuevoNombre, color: nuevoColor }]);
                    setNuevoNombre("");
                    setNuevoColor("#e53935");
                  }}
                >
                  Agregar color
                </Button>
                <Box>
                  <Text fontWeight="bold" mb={2}>Tus colores:</Text>
                  <HStack spacing={2} wrap="wrap">
                    {paleta.map((p, idx) => (
                      <Box key={idx} display="flex" alignItems="center">
                        <Box w="20px" h="20px" bg={p.color} borderRadius="full" border="1px solid #888" mr={2} />
                        <Text fontSize="sm" mr={2}>{p.nombre}</Text>
                        <Button
                          size="xs"
                          colorScheme="red"
                          onClick={() => setPaleta(paleta.filter((_, i) => i !== idx))}
                        >x</Button>
                      </Box>
                    ))}
                  </HStack>
                </Box>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Modal de negocios */}
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
        <Alarm
          isOpen={alarmaModal.abierto}
          onClose={cerrarModalAlarma}
          alarmaModal={alarmaModal}
          setAlarmaModal={setAlarmaModal}
          setTareas={setTareas}
          horasDelDia={horasDelDia}
        />
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
                    onClick={handleGuardarPerfil}
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
        {/* Contenido principal */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
          {/* Columna izquierda */}
          <VStack align="stretch" spacing={6} minW="260px">
            <Box>
              <Text fontSize="md" color="gray.600" mb={2}>Mes:</Text>
              <Box borderRadius="md" p={2} mb={4} bg="white">
                <Calendar
                  onChange={(value) => {
                    if (semanaColaborativa) {
                      alert("No puedes cambiar de semana mientras colaboras. Cancela la colaboración primero.");
                      return;
                    }
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
              <Text fontWeight="bold" mb={1}>Objetivos
                <Tooltip label="Los objetivos son semanales. Al cambiar de semana, 
                  los objetivos también cambian." fontSize="sm" hasArrow>
                  <span style={{ cursor: "pointer", marginLeft: 6 }}>
                    <HelpOutlineIcon fontSize="small" style={{ borderRadius: "50%", background: "#eee", color: "#555" }} />
                  </span>
                </Tooltip>
              </Text>
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
              <Text fontWeight="bold" mb={1}>A tener en cuenta
                <Tooltip label="Aquí puedes escribir detalles personales o 
                 recordatorios importantes para la semana. Es completamente personal." 
                  fontSize="sm" 
                  hasArrow>
                  <span style={{ cursor: "pointer", marginLeft: 6 }}>
                    <HelpOutlineIcon fontSize="small" style={{ borderRadius: "50%", background: "#eee", color: "#555" }} />
                  </span>
                </Tooltip>
              </Text>
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
                    {tareasFiltradas(dia, diasSemana[idx]).map((tarea, i) => {
                      const idxReal = (tareas[dia] || []).findIndex(
                        t => t.texto === tarea.texto && t.fecha === tarea.fecha
                      );
                      return (
                        <ListItem key={i} >
                          <TareaItem
                            tarea={tarea}
                            onToggle={() => toggleTareaCompletada(dia, idxReal)}
                            onDelete={() => eliminarTarea(dia, idxReal)}
                            onAlarma={() => abrirModalAlarma(dia, tarea)}
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                  <HStack>
                    <Input
                      size="sm"
                      placeholder="Nueva tarea"
                      value={nuevaTarea[dia] || ""}
                      onChange={e => handleInputChange(dia, e.target.value)}
                      onBlur={() => handleInputBlur(dia)}
                      onKeyDown={e => { if (e.key === "Enter") agregarTarea(dia, diasSemana[idx]); }}
                      bg="white"
                      borderRadius="10px"
                    />
                    <select
                      style={{ width: 80, height: 32, borderRadius: 6, border: "1px solid #ccc" }}
                      value={colorTarea[dia] || paleta[0]?.color}
                      onChange={e => setColorTarea({ ...colorTarea, [dia]: e.target.value })}
                    >
                      {paleta.map((p, idx) => (
                        <option key={idx} value={p.color}>
                          {p.nombre}
                        </option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => agregarTarea(dia, diasSemana[idx])}
                    >+</Button>
                  </HStack>
                  {Object.entries(escribiendo)
                    .filter(([email, info]) => info && info.dia === dia && email !== userEmail)
                    .map(([email]) => (
                      <Text key={email} fontSize="xs" color="teal.500">
                        {email.split("@")[0]} está escribiendo...
                      </Text>
                    ))}
                </Box>
              ))}
            </SimpleGrid>
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
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
                    {tareasFiltradas(dia, diasSemana[idx + 3]).map((tarea, i) => {
                      const idxReal = (tareas[dia] || []).findIndex(
                        t => t.texto === tarea.texto && t.fecha === tarea.fecha
                      );
                      return (
                        <ListItem key={i} >
                          <TareaItem
                            tarea={tarea}
                            onToggle={() => toggleTareaCompletada(dia, idxReal)}
                            onDelete={() => eliminarTarea(dia, idxReal)}
                            onAlarma={() => abrirModalAlarma(dia, tarea)}
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                  <HStack>
                    <Input
                      size="sm"
                      placeholder="Nueva tarea"
                      value={nuevaTarea[dia] || ""}
                      onChange={e => handleInputChange(dia, e.target.value)}
                      onBlur={() => handleInputBlur(dia)}
                      onKeyDown={e => { if (e.key === "Enter") agregarTarea(dia, diasSemana[idx + 3]); }}
                      bg="white"
                      borderRadius="10px"
                    />
                    <select
                      style={{ width: 80, height: 32, borderRadius: 6, border: "1px solid #ccc" }}
                      value={colorTarea[dia] || paleta[0]?.color}
                      onChange={e => setColorTarea({ ...colorTarea, [dia]: e.target.value })}
                    >
                      {paleta.map((p, idx) => (
                        <option key={idx} value={p.color}>
                          {p.nombre}
                        </option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => agregarTarea(dia, diasSemana[idx + 3])}
                    >+</Button>
                  </HStack>
                  {Object.entries(escribiendo)
                    .filter(([email, info]) => info && info.dia === dia && email !== userEmail)
                    .map(([email]) => (
                      <Text key={email} fontSize="xs" color="teal.500">
                        {email.split("@")[0]} está escribiendo...
                      </Text>
                    ))}
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