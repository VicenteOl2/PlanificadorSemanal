export const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export interface Tarea {
  texto: string;
  fecha: string; // formato ISO
  completada?: boolean;
  color?: string;
  hora?: string;
}

export const horasDelDia = Array.from({ length: 36 }, (_, i) => {
  const h = Math.floor(i / 2) + 6; // desde las 6:00
  const m = i % 2 === 0 ? "00" : "30";
  return `${h.toString().padStart(2, "0")}:${m}`;
});