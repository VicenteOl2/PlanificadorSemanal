"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const WeeklyPlanner = () => {
    const [tasks, setTasks] = (0, react_1.useState)([]);
    const [taskTitle, setTaskTitle] = (0, react_1.useState)('');
    const [taskDay, setTaskDay] = (0, react_1.useState)('');
    const addTask = () => {
        if (taskTitle && taskDay) {
            const newTask = {
                id: tasks.length + 1,
                title: taskTitle,
                day: taskDay,
            };
            setTasks([...tasks, newTask]);
            setTaskTitle('');
            setTaskDay('');
        }
    };
    return (react_1.default.createElement("div", null,
        react_1.default.createElement("h1", null, "Weekly Planner"),
        react_1.default.createElement("input", { type: "text", placeholder: "Task Title", value: taskTitle, onChange: (e) => setTaskTitle(e.target.value) }),
        react_1.default.createElement("input", { type: "text", placeholder: "Day of the Week", value: taskDay, onChange: (e) => setTaskDay(e.target.value) }),
        react_1.default.createElement("button", { onClick: addTask }, "Add Task"),
        react_1.default.createElement("ul", null, tasks.map((task) => (react_1.default.createElement("li", { key: task.id },
            task.title,
            " - ",
            task.day))))));
};
exports.default = WeeklyPlanner;
