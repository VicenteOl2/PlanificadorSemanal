// src/services/planesService.ts
import { db } from "../firebaseConfig";   // ← ../ en vez de ./
import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

/**
 * Crea un nuevo plan en la colección "planes" con ID automático
 */
export async function crearPlan(datos: Record<string, any>) {
  const planesCol = collection(db, "planes");
  return await addDoc(planesCol, datos);
}

/**
 * Obtiene todos los planes de la colección "planes"
 */
export async function listarPlanes() {
  const planesCol = collection(db, "planes");
  const snapshot = await getDocs(planesCol);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Lee un plan existente dado su ID
 */
export async function leerPlan(planId: string) {
  const ref = doc(db, "planes", planId);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

/**
 * Actualiza un plan existente (merge)
 */
export async function actualizarPlan(
  planId: string,
  datos: Partial<Record<string, any>>
) {
  const ref = doc(db, "planes", planId);
  await setDoc(ref, datos, { merge: true });
}

/**
 * Elimina un plan existente
 */
export async function eliminarPlan(planId: string) {
  const ref = doc(db, "planes", planId);
  await deleteDoc(ref);
}