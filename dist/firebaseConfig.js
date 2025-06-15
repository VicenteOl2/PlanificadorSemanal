"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.auth = void 0;
const app_1 = require("firebase/app");
const auth_1 = require("firebase/auth");
const firestore_1 = require("firebase/firestore");
// Tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB2zb6infDtNEHOLHMdKLO2ubz_8lHk8Bw",
    authDomain: "planificador-semanal-3c2b0.firebaseapp.com",
    projectId: "planificador-semanal-3c2b0",
    storageBucket: "planificador-semanal-3c2b0.appspot.com",
    messagingSenderId: "326031876047",
    appId: "1:326031876047:web:a87fa3326d948188a93cba"
};
// Inicializa Firebase
const app = (0, app_1.initializeApp)(firebaseConfig);
// Exporta el objeto auth para usarlo en tu app
exports.auth = (0, auth_1.getAuth)(app);
exports.db = (0, firestore_1.getFirestore)(app); // <-- AGREGA ESTA LÍNEA
