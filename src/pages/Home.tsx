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
import AlarmIcon from '@mui/icons-material/Alarm';
import { nanoid } from "nanoid";

const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

interface Tarea {
  texto: string;
  fecha: string; // formato ISO
  completada?: boolean;
  color?: string;
  hora?: string;
}

const horasDelDia = Array.from({ length: 36 }, (_, i) => {
  const h = Math.floor(i / 2) + 6; // desde las 6:00
  const m = i % 2 === 0 ? "00" : "30";
  return `${h.toString().padStart(2, "0")}:${m}`;
});

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
  const [semanaColaborativa, setSemanaColaborativa] = useState<string | null>(null);
  const [codigoInput, setCodigoInput] = useState(""); // Para unirse a una semana
  const [nuevoColor, setNuevoColor] = useState("#e53935");
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [alarmaModal, setAlarmaModal] = useState<{ abierto: boolean; dia?: string; tarea?: Tarea; hora?: string }>({ abierto: false });
  const colaboracionModal = useDisclosure(); // <-- Modal de colaboración

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

  // --- FUNCIONES COLABORATIVAS ---
  const crearSemanaColaborativa = async () => {
    const codigo = nanoid(6).toUpperCase();
    const ref = doc(db, "semanas", codigo);
    await setDoc(ref, {
      codigo,
      usuarios: [userEmail],
      tareas: {},
      objetivos: {},
      notas: {}
    });
    setSemanaColaborativa(codigo);
    setMensaje(`Semana creada. Código: ${codigo}`);
    setTimeout(() => setMensaje(""), 3000);
  };

  const unirseASemana = async () => {
    const ref = doc(db, "semanas", codigoInput);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      if (!data.usuarios.includes(userEmail)) {
        await setDoc(ref, {
          ...data,
          usuarios: [...data.usuarios, userEmail]
        });
      }
      setSemanaColaborativa(codigoInput);
      setMensaje(`Unido a la semana: ${codigoInput}`);
      setTimeout(() => setMensaje(""), 3000);
    } else {
      alert("Código no válido");
    }
  };

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
        setUserEmail(null);
        setPerfil(prev => ({ ...prev, email: "" }));
        navigate("/login");
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line
  }, []);

  // --- FUNCIONES AUXILIARES ---
  function getDiasSemana(fecha: Date) {
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
  const semanaClave = diasSemana[0].toISOString().slice(0, 10);

  // --- CARGAR DATOS DE FIRESTORE EN TIEMPO REAL ---
  useEffect(() => {
    if (!userEmail && !semanaColaborativa) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const ref = semanaColaborativa
      ? doc(db, "semanas", semanaColaborativa)
      : doc(db, "planes", userEmail!);

    // Sincronización en tiempo real
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
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userEmail, semanaColaborativa]);

  // --- GUARDAR EN FIRESTORE ---
  const handleGuardar = async () => {
    const ref = semanaColaborativa
      ? doc(db, "semanas", semanaColaborativa)
      : doc(db, "planes", userEmail!);
    await setDoc(ref, { tareas, objetivos, notas }, { merge: true });
    setMensaje("¡Planificador guardado en la nube!");
    setTimeout(() => setMensaje(""), 2000);
  };

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
  const handleInputChange = (dia: string, value: string) =>
    setNuevaTarea({ ...nuevaTarea, [dia]: value });

  const agregarTarea = (dia: string, fechaDia: Date) => {
    if (!nuevaTarea[dia]) return;
    const nueva: Tarea = {
      texto: nuevaTarea[dia],
      fecha: fechaDia.toISOString(),
      completada: false,
      color: colorTarea[dia] || paleta[0].color
    };
    setTareas({
      ...tareas,
      [dia]: [...(tareas[dia] || []), nueva],
    });
    setNuevaTarea({ ...nuevaTarea, [dia]: '' });
  };

  const toggleTareaCompletada = (dia: string, idx: number) => {
    setTareas(prev => ({
      ...prev,
      [dia]: prev[dia].map((t, i) =>
        i === idx ? { ...t, completada: !t.completada } : t
      ),
    }));
  };

  const eliminarTarea = (dia: string, index: number) => {
    setTareas({
      ...tareas,
      [dia]: tareas[dia].filter((_, i) => i !== index),
    });
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
    const auth = getAuth();
    await signOut(auth);
    window.location.href = "/login";
  };

  // --- LOADING ---
  if (loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="teal.400" />
        <Text ml={4}>Cargando tu planificador...</Text>
      </Box>
    );
  }

  // --- RETURN ---
  return (
    <Box minH="100vh" p={0} style={{
      backgroundColor: "#fdf6e3",
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
            <Heading size="lg" mb={0}>Planificador semanal</Heading>
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
      {/* Confirmación de semana seleccionada */}
      <Box mb={3} p={2} bg="teal.50" borderRadius="md" border="1px solid #b2f5ea">
        <Text fontWeight="bold" color="teal.700">
          Estás colaborando en la semana del{" "}
          <b>
            {diasSemana[0].toLocaleDateString()} al {diasSemana[6].toLocaleDateString()}
          </b>
        </Text>
      </Box>
      {/* Colaboración */}
      {!semanaColaborativa ? (
        <VStack mb={4}>
          <Button colorScheme="teal" width="100%" onClick={async () => {
            const codigo = nanoid(6).toUpperCase();
            const ref = doc(db, "semanas", `${codigo}_${semanaClave}`);
            await setDoc(ref, {
              codigo,
              semanaClave,
              usuarios: [userEmail],
              tareas: {},
              objetivos: {},
              notas: {}
            });
            setSemanaColaborativa(`${codigo}_${semanaClave}`);
            setMensaje(`Semana creada. Código: ${codigo}`);
            setTimeout(() => setMensaje(""), 3000);
          }}>
            Crear semana colaborativa
          </Button>
          <Input
            placeholder="Código de semana"
            value={codigoInput}
            onChange={e => setCodigoInput(e.target.value.toUpperCase())}
            width="100%"
            mt={1}
          />
          <Button colorScheme="blue" width="100%" onClick={async () => {
            const ref = doc(db, "semanas", `${codigoInput}_${semanaClave}`);
            const snap = await getDoc(ref);
            if (snap.exists()) {
              const data = snap.data();
              if (!data.usuarios.includes(userEmail)) {
                await setDoc(ref, {
                  ...data,
                  usuarios: [...data.usuarios, userEmail]
                });
              }
              setSemanaColaborativa(`${codigoInput}_${semanaClave}`);
              setMensaje(`Unido a la semana: ${codigoInput}`);
              setTimeout(() => setMensaje(""), 3000);
            } else {
              alert("Código o semana no válidos. Asegúrate de que ambos seleccionaron la misma semana.");
            }
          }}>
            Unirse con código
          </Button>
          <Text fontSize="sm" color="gray.600" mt={2}>
            Crea una semana colaborativa y comparte el código con tu pareja o amigos.<br />
            O únete a una semana usando el código y la semana que te compartan.<br />
            <b>Solo podrán colaborar en la semana seleccionada.</b>
          </Text>
        </VStack>
      ) : (
        <Box>
          <Text>
            Semana colaborativa: <b>{semanaColaborativa.split("_")[0]}</b> <br />
            (semana del <b>{diasSemana[0].toLocaleDateString()} al {diasSemana[6].toLocaleDateString()}</b>)
          </Text>
          <Text fontSize="sm" color="teal.700" mt={2}>
            Todos los cambios se sincronizan en tiempo real entre los participantes.
          </Text>
          <Button
            mt={4}
            colorScheme="yellow"
            width="100%"
            onClick={() => {
              if (window.confirm("¿Deseas colaborar en otra semana? Guarda el código de esta semana antes de continuar.")) {
                setSemanaColaborativa(null);
                setCodigoInput("");
                setMensaje("");
              }
            }}
          >
            Colaborar en otra semana
          </Button>
        </Box>
      )}
      {mensaje && (
        <Text color="green.500" mt={2}>{mensaje}</Text>
      )}
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
       {/*Modal de asignación de recordatorio*/}
        <Modal isOpen={alarmaModal.abierto} onClose={cerrarModalAlarma}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Asignar recordatorio</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>
                Asigna una hora para la tarea: <b>{alarmaModal.tarea?.texto}</b>
              </Text>
              <VStack spacing={4} mt={4}>
                <Text>Selecciona la hora para el recordatorio:</Text>
                <Select
                  placeholder="Selecciona la hora"
                  value={alarmaModal.hora || ""}
                  onChange={e =>
                    setAlarmaModal(modal => ({
                      ...modal,
                      hora: e.target.value
                    }))
                  }
                >
                  {horasDelDia.map(hora => (
                    <option key={hora} value={hora}>{hora}</option>
                  ))}
                </Select>
                <Button colorScheme="teal" onClick={() => {
                  if (alarmaModal.dia && typeof alarmaModal.hora === "string" && alarmaModal.tarea) {
                    setTareas(prev => ({
                      ...prev,
                      [alarmaModal.dia!]: prev[alarmaModal.dia!].map(t =>
                        t.texto === alarmaModal.tarea?.texto && t.fecha === alarmaModal.tarea?.fecha
                          ? { ...t, hora: alarmaModal.hora }
                          : t
                      )
                    }));
                  }
                  cerrarModalAlarma();
                }}>
                  Guardar recordatorio
                </Button>
              </VStack>
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
                  <Tooltip label="Los objetivos son semanales. Al cambiar de semana, los objetivos también cambian." fontSize="sm" hasArrow>
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
                 <Tooltip label="Aquí puedes escribir detalles personales o recordatorios importantes para la semana. Es completamente personal." fontSize="sm" hasArrow>
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
                        <ListItem key={i} display="flex" alignItems="center">
                          <Button
                            size="xs"
                            colorScheme="red"
                            variant="ghost"
                            ml={1}
                            onClick={() => abrirModalAlarma(dia, tarea)}
                            title="Asignar recordatorio"
                          >
                            <AlarmIcon fontSize="small" />
                          </Button>
                          <input
                            type="checkbox"
                            checked={tarea.completada || false}
                            onChange={() => toggleTareaCompletada(dia, idxReal)}
                            style={{ marginRight: 8 }}
                          />
                          <Box
                            w="16px"
                            h="16px"
                            borderRadius="4px"
                            bg={tarea.color || "#bdbdbd"}
                            border="1px solid #888"
                            mr={2}
                          />
                          <Text
                            flex="1"
                            color={tarea.completada ? "gray.400" : "#222"}
                            textDecoration={tarea.completada ? "line-through" : "none"}
                            style={{
                              fontFamily: "'Permanent Marker', cursive",
                              fontSize: "1.1em",
                              letterSpacing: "0.5px",
                              transform: "rotate(-1deg)",
                              lineHeight: 1.3,
                            }}
                          >
                            {tarea.texto}
                            {tarea.hora && (
                              <Box as="span" color="teal.600" fontWeight="bold" ml={2} fontSize="sm">
                                ⏰ {tarea.hora}
                              </Box>
                            )}
                          </Text>
                          <Button
                            size="xs"
                            colorScheme="red"
                            ml={2}
                            onClick={() => eliminarTarea(dia, idxReal)}
                          >×</Button>
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
                      onKeyDown={e => { if (e.key === "Enter") agregarTarea(dia, diasSemana[idx]); }}
                      bg="white"
                      borderRadius="10px"
                    />
                    {/* Selector de color dinámico */}
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
                        <ListItem key={i} display="flex" alignItems="center">
                          <Button
                            size="xs"
                            colorScheme="red"
                            variant="ghost"
                            ml={1}
                            onClick={() => abrirModalAlarma(dia, tarea)}
                            title="Asignar recordatorio"
                          >
                            <AlarmIcon fontSize="small" />
                          </Button>
                          <input
                            type="checkbox"
                            checked={tarea.completada || false}
                            onChange={() => toggleTareaCompletada(dia, idxReal)}
                            style={{ marginRight: 8 }}
                          />
                          <Box
                            w="16px"
                            h="16px"
                            borderRadius="4px"
                            bg={tarea.color || "#bdbdbd"}
                            border="1px solid #888"
                            mr={2}
                          />
                          <Text
                            flex="1"
                            color={tarea.completada ? "gray.400" : "#222"}
                            textDecoration={tarea.completada ? "line-through" : "none"}
                            style={{
                              fontFamily: "'Permanent Marker', cursive",
                              fontSize: "1.1em",
                              letterSpacing: "0.5px",
                              transform: "rotate(-1deg)",
                              lineHeight: 1.3,
                            }}
                          >
                            {tarea.texto}
                            {tarea.hora && (
                              <Box as="span" color="teal.600" fontWeight="bold" ml={2} fontSize="sm">
                                ⏰ {tarea.hora}
                              </Box>
                            )}
                          </Text>
                          <Button
                            size="xs"
                            colorScheme="red"
                            ml={2}
                            onClick={() => eliminarTarea(dia, idxReal)}
                          >×</Button>
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
                      onKeyDown={e => { if (e.key === "Enter") agregarTarea(dia, diasSemana[idx + 3]); }}
                      bg="white"
                      borderRadius="10px"
                    />
                    {/* Selector de color dinámico */}
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