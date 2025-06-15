import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB2zb6infDtNEHOLHMdKLO2ubz_8lHk8Bw",
  authDomain: "planificador-semanal-3c2b0.firebaseapp.com",
  projectId: "planificador-semanal-3c2b0",
  storageBucket: "planificador-semanal-3c2b0.appspot.com", // Corrige aquí: .appspot.com
  messagingSenderId: "326031876047",
  appId: "1:326031876047:web:a87fa3326d948188a93cba"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta el objeto auth para usarlo en tu app
export const auth = getAuth(app);
export const db = getFirestore(app); // <-- AGREGA ESTA LÍNEA