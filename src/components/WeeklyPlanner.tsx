import React, { useState } from 'react';

interface Task {
  id: number;
  title: string;
  day: string;
}

const WeeklyPlanner: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDay, setTaskDay] = useState('');

  const addTask = () => {
    if (taskTitle && taskDay) {
      const newTask: Task = {
        id: tasks.length + 1,
        title: taskTitle,
        day: taskDay,
      };
      setTasks([...tasks, newTask]);
      setTaskTitle('');
      setTaskDay('');
    }
  };

  return (
    <div>
      <h1>Weekly Planner</h1>
      <input
        type="text"
        placeholder="Task Title"
        value={taskTitle}
        onChange={(e) => setTaskTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="Day of the Week"
        value={taskDay}
        onChange={(e) => setTaskDay(e.target.value)}
      />
      <button onClick={addTask}>Add Task</button>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.title} - {task.day}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WeeklyPlanner;