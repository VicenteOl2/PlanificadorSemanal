import React, { useEffect, useState } from "react";
import { VStack, Button, Input, Text, Box, Select } from "@chakra-ui/react";
import { Firestore, setDoc, getDoc, doc, onSnapshot } from "firebase/firestore";

interface CollaborateProps {
  semanaColaborativa: string | null;
  setSemanaColaborativa: (v: string | null) => void;
  codigoInput: string;
  setCodigoInput: (v: string) => void;
  mensaje: string;
  setMensaje: (v: string) => void;
  diasSemana: Date[];
  semanaClave: string;
  userEmail: string | null;
  nanoid: (n: number) => string;
  db: Firestore;
  doc: typeof doc;
  setDoc: typeof setDoc;
  getDoc: typeof getDoc;
}

// --- Custom hook para presencia colaborativa ---
export function usePresenciaColaborativa({
  semanaColaborativa,
  userEmail,
  db
}: {
  semanaColaborativa: string | null,
  userEmail: string | null,
  db: Firestore
}) {
  const [escribiendo, setEscribiendo] = useState<{ [email: string]: { dia: string; texto: string } | null }>({});

  useEffect(() => {
    if (!semanaColaborativa) return;
    const ref = doc(db, "semanas", semanaColaborativa);
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setEscribiendo(data.escribiendo || {});
      }
    });
    return () => unsubscribe();
  }, [semanaColaborativa, db]);

 const setPresencia = async (dia: string, value: string) => {
    if (semanaColaborativa && userEmail) {
      const ref = doc(db, "semanas", semanaColaborativa);
      const snap = await getDoc(ref);
      let escribiendoActual = {};
      if (snap.exists()) {
        escribiendoActual = snap.data().escribiendo || {};
      }
      await setDoc(ref, {
        escribiendo: {
          ...escribiendoActual,
          [userEmail]: value ? { dia, texto: value } : null
        }
      }, { merge: true });
    }
  };

  return { escribiendo, setPresencia };
}

const Collaborate: React.FC<CollaborateProps> = ({
  semanaColaborativa,
  setSemanaColaborativa,
  codigoInput,
  setCodigoInput,
  mensaje,
  setMensaje,
  diasSemana,
  semanaClave,
  userEmail,
  nanoid,
  db,
  doc,
  setDoc,
  getDoc,
}) => {
  const [diasColaboracion, setDiasColaboracion] = useState<number>(7);
  const [usuarios, setUsuarios] = useState<string[]>([]);

  useEffect(() => {
    const guardada = localStorage.getItem("semanaColaborativa");
    if (guardada && !semanaColaborativa) {
      setSemanaColaborativa(guardada);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (semanaColaborativa) {
      localStorage.setItem("semanaColaborativa", semanaColaborativa);
    } else {
      localStorage.removeItem("semanaColaborativa");
    }
  }, [semanaColaborativa]);

  useEffect(() => {
    if (semanaColaborativa) {
      const ref = doc(db, "semanas", semanaColaborativa);
      getDoc(ref).then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          setUsuarios(data.usuarios || []);
        }
      });
    } else {
      setUsuarios([]);
    }
  }, [semanaColaborativa, db, doc, getDoc]);



  return (
    <>
      {!userEmail ? (
  <Text color="red.500" mb={2}>
    No has iniciado sesión. Por favor, inicia sesión para colaborar.
  </Text>
) : (
  <Text color="gray.600" mb={2}>
    Sesión iniciada como: <b>{userEmail}</b>
  </Text>
)}
      {!semanaColaborativa ? (
        <VStack mb={4}>
          <Select
            value={diasColaboracion}
            onChange={e => setDiasColaboracion(Number(e.target.value))}
            mb={2}
          >
            <option value={7}>1 semana (7 días)</option>
            <option value={14}>2 semanas (14 días)</option>
            <option value={30}>1 mes (30 días)</option>
            <option value={60}>2 meses (60 días)</option>
          </Select>
          <Button colorScheme="teal" width="100%" onClick={async () => {
            const codigo = nanoid(6).toUpperCase();
            const ref = doc(db, "semanas", `${codigo}_${semanaClave}`);
            await setDoc(ref, {
              codigo,
              semanaClave,
              usuarios: [userEmail],
              tareas: {},
              objetivos: {},
              notas: {},
              diasColaboracion
            });
            setSemanaColaborativa(`${codigo}_${semanaClave}`);
            setMensaje(`Semana creada. Código: ${codigo}`);
            setTimeout(() => setMensaje(""), 3000);
          }}>
            Crear colaboración
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
              setMensaje(`Unido a la colaboración: ${codigoInput}`);
              setTimeout(() => setMensaje(""), 3000);
            } else {
              alert("Código o semana no válidos. Asegúrate de que ambos seleccionaron la misma semana.");
            }
          }}>
            Unirse con código
          </Button>
          <Text fontSize="sm" color="gray.600" mt={2}>
            Crea una colaboración y comparte el código.<br />
            O únete usando el código y la semana que te compartan.<br />
            <b>Solo podrán colaborar en la semana seleccionada.</b>
          </Text>
        </VStack>
      ) : (
        <Box>
          <Text>
            Colaboración: <b>{semanaColaborativa.split("_")[0]}</b> <br />
            (del <b>{diasSemana[0].toLocaleDateString()} al {diasSemana[diasColaboracion - 1]?.toLocaleDateString() || diasSemana[6].toLocaleDateString()}</b>)
          </Text>
          <Text fontSize="sm" color="teal.700" mt={2}>
            Todos los cambios se sincronizan en tiempo real entre los participantes.
          </Text>
          <Box mt={2}>
            <Text fontWeight="bold" fontSize="sm" color="teal.600">
              Colaborando con:
            </Text>
            <VStack align="start" spacing={0}>
              {usuarios.map((u: string) => (
                <Text key={u} fontSize="sm" color={u === userEmail ? "blue.500" : "gray.700"}>
                  {u === userEmail ? "Tú" : u}
                </Text>
              ))}
            </VStack>
          </Box>
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
          <Button
            mt={2}
            colorScheme="red"
            width="100%"
            onClick={() => {
              if (window.confirm("¿Seguro que quieres cancelar la colaboración?")) {
                setSemanaColaborativa(null);
                setCodigoInput("");
                setMensaje("Colaboración cancelada.");
              }
            }}
          >
            Cancelar colaboración
          </Button>
        </Box>
      )}
      {mensaje && (
        <Text color="green.500" mt={2}>{mensaje}</Text>
      )}
    </>
  );
};

export default Collaborate;