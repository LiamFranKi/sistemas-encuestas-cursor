const admin = require('firebase-admin');

// Cambia la ruta al archivo de credenciales que descargaste
const serviceAccount = require('./firebase-adminsdk.json');

// Cambia este UID por el UID de tu usuario admin (lo ves en la consola de Firebase)
const uid = 'DEmvXLHyoVNC7ME4BlPp2GKYrqq2';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log('¡Usuario ahora es admin!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error asignando claim:', error);
    process.exit(1);
  });