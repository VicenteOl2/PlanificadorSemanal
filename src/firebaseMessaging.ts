import { getMessaging, getToken, onMessage } from "firebase/messaging";
// Exporta la instancia de Firebase App
import { firebaseApp } from "./firebaseConfig"; // Asegúrate de exportar firebaseApp

const messaging = getMessaging(firebaseApp);

export const requestNotificationPermission = async () => {
  try {
    const token = await getToken(messaging, {
      vapidKey: "BNzKSh0BRXZVNvcjRm4lFPxOVl6L43Elsiy5pfdeG4G0J15a3fpGzq24wNKn18NGeHlw6bZhEDcjYZbzwDUOOdU"
    });
    if (token) {
      console.log("Token de notificaciones:", token);
      // Puedes guardar este token en tu base de datos si lo necesitas
    } else {
      console.log("No se obtuvo token. El usuario no otorgó permisos.");
    }
  } catch (error) {
    console.error("Error al obtener el token de notificaciones:", error);
  }
};

// Para escuchar mensajes cuando la app está abierta
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });