import { db } from '../config/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from '../config/firebase';

// Obtener todos los usuarios de Firestore
export const obtenerUsuarios = async () => {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Crear usuario usando Cloud Function
export const crearUsuario = async ({ email, password, name, role }) => {
  const functions = getFunctions(app);
  const createUserWithRole = httpsCallable(functions, 'createUserWithRole');
  const result = await createUserWithRole({ email, password, name, role });
  return result.data;
};

// Actualizar usuario en Firestore (y opcionalmente en Auth si cambia el email)
export const actualizarUsuario = async (uid, { email, name, role }) => {
  // Actualizar en Firestore
  await updateDoc(doc(db, 'users', uid), { email, name, role });
  // Si se requiere actualizar el email en Auth, debe hacerse desde el contexto del usuario autenticado
};

// Eliminar usuario de Firestore (eliminar de Auth requiere privilegios especiales)
export const eliminarUsuario = async (uid) => {
  // Eliminar de Firestore
  await deleteDoc(doc(db, 'users', uid));
  // Eliminar de Auth: solo el propio usuario autenticado puede eliminarse a sí mismo desde el frontend
};

// Obtener usuario por UID
export const obtenerUsuarioPorId = async (uid) => {
  const docSnap = await getDoc(doc(db, 'users', uid));
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
}; 