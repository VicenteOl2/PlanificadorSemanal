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
const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const Home = () => {
    const [tareas, setTareas] = (0, react_1.useState)({});
    const [nuevaTarea, setNuevaTarea] = (0, react_1.useState)({});
    const handleInputChange = (dia, value) => {
        setNuevaTarea(Object.assign(Object.assign({}, nuevaTarea), { [dia]: value }));
    };
    const agregarTarea = (dia) => {
        if (!nuevaTarea[dia])
            return;
        setTareas(Object.assign(Object.assign({}, tareas), { [dia]: [...(tareas[dia] || []), nuevaTarea[dia]] }));
        setNuevaTarea(Object.assign(Object.assign({}, nuevaTarea), { [dia]: '' }));
    };
    const eliminarTarea = (dia, index) => {
        setTareas(Object.assign(Object.assign({}, tareas), { [dia]: tareas[dia].filter((_, i) => i !== index) }));
    };
    return (react_1.default.createElement("div", null,
        react_1.default.createElement("h1", null, "Planificador Semanal"),
        react_1.default.createElement("div", { style: { display: 'flex', gap: '20px', flexWrap: 'wrap' } }, dias.map((dia) => (react_1.default.createElement("div", { key: dia, style: { border: '1px solid #ccc', padding: '10px', borderRadius: '8px', minWidth: '200px' } },
            react_1.default.createElement("h2", null, dia),
            react_1.default.createElement("ul", null, (tareas[dia] || []).map((tarea, idx) => (react_1.default.createElement("li", { key: idx, style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                react_1.default.createElement("span", null, tarea),
                react_1.default.createElement("button", { onClick: () => eliminarTarea(dia, idx), style: { marginLeft: '10px' } }, "\u274C"))))),
            react_1.default.createElement("input", { type: "text", placeholder: `Agregar tarea para ${dia}`, value: nuevaTarea[dia] || '', onChange: (e) => handleInputChange(dia, e.target.value), style: { width: '70%' } }),
            react_1.default.createElement("button", { onClick: () => agregarTarea(dia), style: { marginLeft: '5px' } }, "Agregar")))))));
};
exports.default = Home;
