import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where,
  updateDoc,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Colecciones
const COLECCIONES = {
  GRADOS: 'grados',
  DOCENTES: 'docentes',
  ENCUESTAS: 'encuestas',
  PREGUNTAS: 'preguntas',
  ALTERNATIVAS: 'alternativas',
  GRADOS_DOCENTES: 'grados-docentes',
  ENCUESTA_PREGUNTA: 'encuesta_pregunta',
  PREGUNTA_ALTERNATIVA: 'pregunta_alternativa',
  RESPUESTAS: 'respuestas',
  USERS: 'users'
};

// Funciones para Grados
export const getGrados = async () => {
  const gradosRef = collection(db, COLECCIONES.GRADOS);
  const snapshot = await getDocs(gradosRef);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Funciones para Docentes
export const getDocentesByGrado = async (gradoId) => {
  const gradosDocentesRef = collection(db, COLECCIONES.GRADOS_DOCENTES);
  const q = query(gradosDocentesRef, where('gradoId', '==', gradoId));
  const snapshot = await getDocs(q);
  
  const docentesPromises = snapshot.docs.map(async (doc) => {
    const docenteRef = doc.data().docenteId;
    const docenteDoc = await getDoc(doc(db, COLECCIONES.DOCENTES, docenteRef));
    return {
      id: docenteDoc.id,
      ...docenteDoc.data()
    };
  });

  return Promise.all(docentesPromises);
};

// Funciones para Encuestas
export const getEncuestaActiva = async () => {
  const encuestasRef = collection(db, COLECCIONES.ENCUESTAS);
  const q = query(encuestasRef, where('estado', '==', 'activa'));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    throw new Error('No hay encuesta activa');
  }

  return {
    id: snapshot.docs[0].id,
    ...snapshot.docs[0].data()
  };
};

// Funciones para Preguntas
export const getPreguntasByEncuesta = async (encuestaId) => {
  const encuestaPreguntasRef = collection(db, COLECCIONES.ENCUESTA_PREGUNTA);
  const q = query(encuestaPreguntasRef, where('encuesta_id', '==', encuestaId));
  const snapshot = await getDocs(q);
  
  const preguntasPromises = snapshot.docs.map(async (docSnap) => {
    const preguntaRef = docSnap.data().pregunta_id;
    const preguntaDoc = await getDoc(doc(db, COLECCIONES.PREGUNTAS, preguntaRef));
    return {
      id: preguntaDoc.id,
      ...preguntaDoc.data()
    };
  });

  return Promise.all(preguntasPromises);
};

// Funciones para Alternativas
export const getAlternativasByPregunta = async (preguntaId) => {
  const preguntaAlternativasRef = collection(db, COLECCIONES.PREGUNTA_ALTERNATIVA);
  const q = query(preguntaAlternativasRef, where('pregunta_id', '==', preguntaId));
  const snapshot = await getDocs(q);
  
  const alternativasPromises = snapshot.docs.map(async (docSnap) => {
    const alternativaRef = docSnap.data().alternativa_id;
    const alternativaDoc = await getDoc(doc(db, COLECCIONES.ALTERNATIVAS, alternativaRef));
    return {
      id: alternativaDoc.id,
      ...alternativaDoc.data()
    };
  });

  return Promise.all(alternativasPromises);
};

// Funciones para Respuestas
export const guardarRespuestas = async (gradoId, encuestaId, preguntaId, respuestas) => {
  const respuestasRef = collection(db, COLECCIONES.RESPUESTAS);
  
  const respuestasPromises = Object.entries(respuestas).map(([docenteId, alternativaId]) => {
    return addDoc(respuestasRef, {
      grado_id: gradoId,
      encuesta_id: encuestaId,
      pregunta_id: preguntaId,
      docente_id: docenteId,
      alternativa_id: alternativaId,
      timestamp: serverTimestamp()
    });
  });

  return Promise.all(respuestasPromises);
};

// Funciones para Usuarios
export const getUsers = async () => {
  try {
    const usersRef = collection(db, COLECCIONES.USERS);
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const userRef = doc(db, COLECCIONES.USERS, userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const usersRef = collection(db, COLECCIONES.USERS);
    const docRef = await addDoc(usersRef, userData);
    return {
      id: docRef.id,
      ...userData
    };
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const userRef = doc(db, COLECCIONES.USERS, userId);
    await updateDoc(userRef, userData);
    return {
      id: userId,
      ...userData
    };
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const userRef = doc(db, COLECCIONES.USERS, userId);
    await deleteDoc(userRef);
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    throw error;
  }
};

/**
 * Elimina el campo 'activo' de todos los documentos en la colección grados_docentes.
 * Uso: importar y ejecutar esta función desde un entorno Node.js con permisos de admin.
 */
export const limpiarCampoActivoGradosDocentes = async () => {
  const gradosDocentesRef = collection(db, 'grados_docentes');
  const snapshot = await getDocs(gradosDocentesRef);
  let count = 0;
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    if (data.hasOwnProperty('activo')) {
      await updateDoc(doc(db, 'grados_docentes', docSnap.id), {
        activo: window.firebase.firestore.FieldValue.delete ? window.firebase.firestore.FieldValue.delete() : undefined
      });
      count++;
    }
  }
  console.log(`Campo 'activo' eliminado de ${count} documentos en grados_docentes.`);
}; 