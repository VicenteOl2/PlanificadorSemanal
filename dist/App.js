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
const firebaseConfig_1 = require("./firebaseConfig");
const auth_1 = require("firebase/auth");
const Home_1 = __importDefault(require("./pages/Home"));
const AuthMenu = ({ user }) => {
    const [email, setEmail] = (0, react_1.useState)("");
    const [pass, setPass] = (0, react_1.useState)("");
    const [isRegister, setIsRegister] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)("");
    const handleAuth = (e) => __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault();
        setError("");
        try {
            if (isRegister) {
                yield (0, auth_1.createUserWithEmailAndPassword)(firebaseConfig_1.auth, email, pass);
            }
            else {
                yield (0, auth_1.signInWithEmailAndPassword)(firebaseConfig_1.auth, email, pass);
            }
        }
        catch (err) {
            setError(err.message);
        }
    });
    return user ? (react_1.default.createElement("div", { style: { textAlign: "center", margin: 20 } },
        react_1.default.createElement("span", null,
            "Sesi\u00F3n iniciada como ",
            react_1.default.createElement("b", null, user.email)),
        react_1.default.createElement("button", { onClick: () => (0, auth_1.signOut)(firebaseConfig_1.auth), style: { marginLeft: 10 } }, "Cerrar sesi\u00F3n"))) : (react_1.default.createElement("form", { onSubmit: handleAuth, style: { textAlign: "center", margin: 20 } },
        react_1.default.createElement("h2", null, isRegister ? "Registro" : "Iniciar sesión"),
        react_1.default.createElement("input", { type: "email", placeholder: "Correo", value: email, onChange: e => setEmail(e.target.value), required: true, style: { margin: 5 } }),
        react_1.default.createElement("input", { type: "password", placeholder: "Contrase\u00F1a", value: pass, onChange: e => setPass(e.target.value), required: true, style: { margin: 5 } }),
        react_1.default.createElement("button", { type: "submit" }, isRegister ? "Registrarse" : "Entrar"),
        react_1.default.createElement("div", null,
            react_1.default.createElement("button", { type: "button", onClick: () => setIsRegister(!isRegister), style: { marginTop: 10 } }, isRegister ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate")),
        error && react_1.default.createElement("div", { style: { color: "red" } }, error)));
};
const App = () => {
    const [user, setUser] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const unsub = (0, auth_1.onAuthStateChanged)(firebaseConfig_1.auth, setUser);
        return () => unsub();
    }, []);
    return (react_1.default.createElement("div", null,
        react_1.default.createElement(AuthMenu, { user: user }),
        user && react_1.default.createElement(Home_1.default, { userEmail: user.email || "" })));
};
exports.default = App;
