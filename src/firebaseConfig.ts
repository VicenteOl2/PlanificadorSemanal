// src/firebaseConfig.ts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración de tu proyecto en Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB2zb6infDtNEHOLHMdKLO2ubz_8lHk8Bw",
  authDomain: "planificador-semanal-3c2b0.firebaseapp.com",
  projectId: "planificador-semanal-3c2b0",
  storageBucket: "planificador-semanal-3c2b0.appspot.com",
  messagingSenderId: "326031876047",
  appId: "1:326031876047:web:a87fa3326d948188a93cba",
};

// Inicializa la app solo una vez
const firebaseApp = initializeApp(firebaseConfig);

// Exporta la instancia para poder usarla en Messaging, etc.
export { firebaseApp };

export const auth = getAuth(firebaseApp);
export const db   = getFirestore(firebaseApp);
