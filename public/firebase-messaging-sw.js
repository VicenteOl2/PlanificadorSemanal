importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyD-DGbSpja8EiNUmDk7UElskvceHfd6xGc",
  authDomain: "planificador-semanal-3c2b0.firebaseapp.com",
  projectId: "planificador-semanal-3c2b0",
  messagingSenderId: "326031876047",
  appId: "1:326031876047:web:a87fa3326d948188a93cba"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  self.registration.showNotification(
    payload.notification.title,
    {
      body: payload.notification.body,
      icon: '/logo.png',
    }
  );
});