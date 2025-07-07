import React from "react";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, VStack, Text, Select, Button } from "@chakra-ui/react";
import { Tarea } from "../utils/planificador";

interface AlarmProps {
  isOpen: boolean;
  onClose: () => void;
  alarmaModal: {
    abierto: boolean;
    dia?: string;
    tarea?: Tarea;
    hora?: string;
  };
  setAlarmaModal: React.Dispatch<React.SetStateAction<{
    abierto: boolean;
    dia?: string;
    tarea?: Tarea;
    hora?: string;
  }>>;
  setTareas: React.Dispatch<React.SetStateAction<{ [dia: string]: Tarea[] }>>;
  horasDelDia: string[];
}

const Alarm: React.FC<AlarmProps> = ({
  isOpen,
  onClose,
  alarmaModal,
  setAlarmaModal,
  setTareas,
  horasDelDia
}) => (
  <Modal isOpen={isOpen} onClose={onClose}>
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
            onClose();
          }}>
            Guardar recordatorio
          </Button>
        </VStack>
      </ModalBody>
    </ModalContent>
  </Modal>
);

export default Alarm;