import React from 'react';
import { Box,Text,Button } from '@chakra-ui/react';
import AlarmIcon from '@mui/icons-material/Alarm';
import { Tarea } from '../utils/planificador';

interface TareaProps {
  tarea: Tarea;
  onToggle: () => void;
    onDelete: () => void;
    onAlarma: () => void;
}

const TareaItem: React.FC<TareaProps> = ({ tarea, onToggle, onDelete, onAlarma }) => (
  <Box display="flex" alignItems="center">
    <Button
      size="xs"
      colorScheme="red"
      variant="ghost"
      ml={1}
      onClick={onAlarma}
      title="Asignar recordatorio"
    >
      <AlarmIcon fontSize="small" />
    </Button>
    <input
      type="checkbox"
      checked={tarea.completada || false}
      onChange={onToggle}
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
      onClick={onDelete}
    >×</Button>
  </Box>
);

export default TareaItem;