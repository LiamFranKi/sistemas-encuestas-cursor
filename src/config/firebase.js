import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCYOC4u5EUGCi8n8iFMTy-JXYVlCZj4CjA",
  authDomain: "encuestas-cursor.firebaseapp.com",
  projectId: "encuestas-cursor",
  storageBucket: "encuestas-cursor.firebasestorage.app",
  messagingSenderId: "148528256895",
  appId: "1:148528256895:web:fe7bd0c52e8934b2276c4a",
  measurementId: "G-TQS9P6NF9D"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { auth, db, analytics };
export default app; 