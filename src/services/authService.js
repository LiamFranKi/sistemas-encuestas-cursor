import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const auth = getAuth();

export const login = async (email, password) => {
  try {
    console.log('Iniciando proceso de login...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Usuario autenticado:', userCredential.user.uid);
    
    // Verificar si existe el documento del usuario
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    console.log('Documento de usuario:', userDoc.exists() ? 'existe' : 'no existe');
    
    if (!userDoc.exists()) {
      console.log('Creando documento de usuario...');
      // Si no existe, crear el documento con rol por defecto
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        rol: 'admin', // Rol por defecto
        createdAt: new Date()
      });
      console.log('Documento de usuario creado');
    }
    
    return userCredential.user;
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};

export const register = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    try {
      // Crear el documento del usuario con rol admin
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: 'admin',
        createdAt: new Date()
      });
    } catch (dbError) {
      console.error('Error al crear usuario en Firestore:', dbError);
      // No lanzamos el error para permitir el registro incluso si hay problemas con Firestore
    }
    
    return user;
  } catch (error) {
    console.error('Error en registro:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error en logout:', error);
    throw error;
  }
}; 