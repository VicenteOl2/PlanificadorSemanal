import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Input,
  Button,
  Select,
  SimpleGrid,
  VStack,
  HStack,
  IconButton,
  Textarea,
  Checkbox,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { useColorModeValue } from '@chakra-ui/react';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  completed: boolean;
}

export interface WeeklyPlan {
  weekStart: Date;
  tasks: Task[];
}

const daysOfWeek = [
  'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo',
];

const WeeklyPlanner: React.FC = () => {
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan>({
    weekStart: new Date(),
    tasks: [],
  });

  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDay, setTaskDay] = useState('');

  const addTask = () => {
    if (taskTitle && taskDay) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: taskTitle,
        description: taskDescription,
        dueDate: new Date(),
        completed: false,
      };

      setWeeklyPlan(prev => ({
        ...prev,
        tasks: [...prev.tasks, newTask],
      }));

      setTaskTitle('');
      setTaskDescription('');
      setTaskDay('');
    }
  };

  const toggleComplete = (id: string) => {
    const updated = weeklyPlan.tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setWeeklyPlan({ ...weeklyPlan, tasks: updated });
  };

  const deleteTask = (id: string) => {
    setWeeklyPlan({
      ...weeklyPlan,
      tasks: weeklyPlan.tasks.filter(task => task.id !== id),
    });
  };

  return (
    <Box maxW="800px" mx="auto" mt={10} p={4}>
      <Heading textAlign="center" mb={6} color="blue.600">
        Planificador Semanal
      </Heading>

      <Box bg="gray.100" p={4} rounded="md" mb={8} boxShadow="md">
        <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4} mb={4}>
          <Input
            placeholder="Título de la tarea"
            value={taskTitle}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTaskTitle(e.target.value)}
          />
          <Select
            placeholder="Día de la semana"
            value={taskDay}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTaskDay(e.target.value)}
          >
            {daysOfWeek.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </Select>
          <Button colorScheme="blue" onClick={addTask}>
            Agregar
          </Button>
        </SimpleGrid>
        <Textarea
          placeholder="Descripción (opcional)"
          value={taskDescription}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTaskDescription(e.target.value)}
        />
      </Box>

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6}>
        {daysOfWeek.map(day => (
          <Box
            key={day}
            bg={useColorModeValue("white", "gray.700")}
            p={4}
            rounded="md"
            boxShadow="sm"
            minH="140px"
          >
            <Text fontWeight="bold" fontSize="lg" textAlign="center" mb={2} color="blue.600">
              {day}
            </Text>
            <VStack align="stretch" spacing={2}>
              {weeklyPlan.tasks.filter(task => taskDayFromDate(task.dueDate) === day).length === 0 ? (
                <Text color="gray.500" fontSize="sm">Sin tareas</Text>
              ) : (
                weeklyPlan.tasks
                  .filter(task => taskDayFromDate(task.dueDate) === day)
                  .map(task => (
                    <Box
                      key={task.id}
                      p={2}
                      borderRadius="md"
                      bg={task.completed ? "green.100" : "gray.50"}
                    >
                      <HStack justify="space-between" align="start">
                        <Box flex="1">
                          <Checkbox
                            isChecked={task.completed}
                            onChange={() => toggleComplete(task.id)}
                            mb={1}
                          >
                            <Text fontWeight="medium">{task.title}</Text>
                          </Checkbox>
                          {task.description && (
                            <Text fontSize="sm" color="gray.600">
                              {task.description}
                            </Text>
                          )}
                        </Box>
                      <IconButton
                        aria-label="Eliminar"
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => deleteTask(task.id)}
                        />
                      </HStack>
                    </Box>
                  ))
              )}
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};

function taskDayFromDate(date: Date): string {
  const jsDate = new Date(date);
  const days = [
    "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"
  ];
  return days[jsDate.getDay()];
}

export default WeeklyPlanner;