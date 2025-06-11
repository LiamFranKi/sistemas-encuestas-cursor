import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Crear una nueva encuesta
export const crearEncuesta = async (encuestaData) => {
  try {
    const docRef = await addDoc(collection(db, 'encuestas'), {
      ...encuestaData,
      createdAt: new Date().toISOString(),
      active: true
    });
    return docRef.id;
  } catch (error) {
    throw new Error('Error al crear la encuesta: ' + error.message);
  }
};

// Obtener todas las encuestas
export const obtenerEncuestas = async () => {
  try {
    const q = query(
      collection(db, 'encuestas'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw new Error('Error al obtener las encuestas: ' + error.message);
  }
};

// Obtener una encuesta específica
export const obtenerEncuesta = async (encuestaId) => {
  try {
    const docRef = doc(db, 'encuestas', encuestaId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    }
    throw new Error('Encuesta no encontrada');
  } catch (error) {
    throw new Error('Error al obtener la encuesta: ' + error.message);
  }
};

// Actualizar una encuesta
export const actualizarEncuesta = async (encuestaId, encuestaData) => {
  try {
    const docRef = doc(db, 'encuestas', encuestaId);
    await updateDoc(docRef, {
      ...encuestaData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    throw new Error('Error al actualizar la encuesta: ' + error.message);
  }
};

// Eliminar una encuesta
export const eliminarEncuesta = async (encuestaId) => {
  try {
    const docRef = doc(db, 'encuestas', encuestaId);
    await deleteDoc(docRef);
  } catch (error) {
    throw new Error('Error al eliminar la encuesta: ' + error.message);
  }
};

// Obtener estadísticas de encuestas
export const obtenerEstadisticas = async () => {
  try {
    const encuestasRef = collection(db, 'encuestas');
    const respuestasRef = collection(db, 'respuestas');
    
    const [encuestasSnapshot, respuestasSnapshot] = await Promise.all([
      getDocs(encuestasRef),
      getDocs(query(respuestasRef, where('estado', '==', 'completada')))
    ]);

    return {
      total: encuestasSnapshot.size,
      completadas: respuestasSnapshot.size
    };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return {
      total: 0,
      completadas: 0
    };
  }
};

// Obtener respuestas con filtros opcionales
export const obtenerRespuestas = async (filtros = {}) => {
  try {
    const respuestasRef = collection(db, 'respuestas');
    let q = query(respuestasRef);

    // Aplicar filtros si existen
    if (filtros.estado) {
      q = query(q, where('estado', '==', filtros.estado));
    }
    if (filtros.encuestaId) {
      q = query(q, where('encuestaId', '==', filtros.encuestaId));
    }
    if (filtros.docenteId) {
      q = query(q, where('docenteId', '==', filtros.docenteId));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener respuestas:', error);
    return [];
  }
};

// Guardar una respuesta
export const guardarRespuesta = async (respuestaData) => {
  try {
    const docRef = await addDoc(collection(db, 'respuestas'), {
      ...respuestaData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    throw new Error('Error al guardar la respuesta: ' + error.message);
  }
};

// Funciones para Respuestas
export const crearRespuesta = async (respuestaData) => {
  try {
    const docRef = await addDoc(collection(db, 'respuestas'), {
      ...respuestaData,
      createdAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    throw new Error('Error al crear la respuesta: ' + error.message);
  }
};

export const obtenerRespuestasPorDocente = async (docenteId) => {
  try {
    const q = query(
      collection(db, 'respuestas'),
      where('docenteId', '==', docenteId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw new Error('Error al obtener las respuestas del docente: ' + error.message);
  }
}; 