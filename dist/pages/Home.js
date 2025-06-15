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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const html2canvas_1 = __importDefault(require("html2canvas"));
const firebaseConfig_1 = require("../firebaseConfig");
const firestore_1 = require("firebase/firestore");
const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const colores = [
    '#FFB6B9', '#FAE3D9', '#BBDED6', '#8AC6D1', '#FFD3B4', '#FFAAA7', '#D5ECC2'
];
const Home = ({ userEmail }) => {
    const [tareas, setTareas] = (0, react_1.useState)({});
    const [nuevaTarea, setNuevaTarea] = (0, react_1.useState)({});
    const [animados, setAnimados] = (0, react_1.useState)({});
    const [mensaje, setMensaje] = (0, react_1.useState)("");
    (0, react_1.useEffect)(() => {
        const cargarTareas = () => __awaiter(void 0, void 0, void 0, function* () {
            const ref = (0, firestore_1.doc)(firebaseConfig_1.db, "planes", userEmail);
            const snap = yield (0, firestore_1.getDoc)(ref);
            if (snap.exists())
                setTareas(snap.data().tareas || {});
        });
        cargarTareas();
    }, [userEmail]);
    const handleInputChange = (dia, value) => setNuevaTarea(Object.assign(Object.assign({}, nuevaTarea), { [dia]: value }));
    const agregarTarea = (dia) => {
        if (!nuevaTarea[dia])
            return;
        setTareas(Object.assign(Object.assign({}, tareas), { [dia]: [...(tareas[dia] || []), nuevaTarea[dia]] }));
        setNuevaTarea(Object.assign(Object.assign({}, nuevaTarea), { [dia]: '' }));
        setAnimados(Object.assign(Object.assign({}, animados), { [dia]: true }));
        setTimeout(() => setAnimados((prev) => (Object.assign(Object.assign({}, prev), { [dia]: false }))), 300);
    };
    const eliminarTarea = (dia, index) => {
        setTareas(Object.assign(Object.assign({}, tareas), { [dia]: tareas[dia].filter((_, i) => i !== index) }));
    };
    const handleGuardar = () => __awaiter(void 0, void 0, void 0, function* () {
        // Guarda en Firestore
        const ref = (0, firestore_1.doc)(firebaseConfig_1.db, "planes", userEmail);
        yield (0, firestore_1.setDoc)(ref, { tareas });
        setMensaje("¡Planificador guardado en la nube!");
        // También genera imagen (opcional)
        const planDiv = document.getElementById("planificador-semanal");
        if (planDiv) {
            const canvas = yield (0, html2canvas_1.default)(planDiv);
            const imgData = canvas.toDataURL("image/png");
            // Aquí podrías enviar imgData a un backend o usar EmailJS
        }
    });
    return (react_1.default.createElement("div", null,
        react_1.default.createElement("h1", { style: { textAlign: 'center', color: '#ffb347', marginBottom: 30, letterSpacing: 2, textShadow: '2px 2px 8px #000' } }, "Planificador Semanal"),
        react_1.default.createElement("div", { id: "planificador-semanal", style: { display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' } }, dias.map((dia, i) => (react_1.default.createElement("div", { key: dia, className: "card-dia", style: {
                background: colores[i],
                padding: '16px',
                borderRadius: '14px',
                minWidth: '220px',
                marginBottom: '20px',
                border: 'none',
                opacity: 0.93,
            } },
            react_1.default.createElement("h2", { style: { color: '#444', textAlign: 'center', marginBottom: 10 } }, dia),
            react_1.default.createElement("ul", { style: { minHeight: 40, paddingLeft: 0 } }, (tareas[dia] || []).map((tarea, idx) => (react_1.default.createElement("li", { key: idx, style: {
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'rgba(255,255,255,0.7)', borderRadius: 6, padding: '4px 8px', marginBottom: 6,
                } },
                react_1.default.createElement("span", { style: { color: '#333' } }, tarea),
                react_1.default.createElement("button", { className: "eliminar-btn", onClick: () => eliminarTarea(dia, idx) }, "\u2715"))))),
            react_1.default.createElement("div", { style: { display: 'flex', alignItems: 'center', marginTop: 8 } },
                react_1.default.createElement("input", { className: "input-tarea", type: "text", placeholder: `Agregar tarea para ${dia}`, value: nuevaTarea[dia] || '', onChange: (e) => handleInputChange(dia, e.target.value), style: { width: '70%' } }),
                react_1.default.createElement("button", { className: `boton-agregar${animados[dia] ? ' animado' : ''}`, onClick: () => agregarTarea(dia), style: { marginLeft: '8px' } }, "Agregar")))))),
        react_1.default.createElement("button", { onClick: handleGuardar, style: {
                display: "block",
                margin: "30px auto 0 auto",
                padding: "12px 32px",
                background: "#ffb347",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontWeight: "bold",
                fontSize: "18px",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(255, 179, 71, 0.2)",
            } }, "Guardar cambios"),
        mensaje && react_1.default.createElement("div", { style: { textAlign: "center", color: "green", marginTop: 10 } }, mensaje)));
};
exports.default = Home;
