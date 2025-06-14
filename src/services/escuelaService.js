import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  limit,
  getDoc,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Funciones para Grados
export const crearGrado = async (gradoData) => {
  try {
    const docRef = await addDoc(collection(db, 'grados'), {
      ...gradoData,
      createdAt: new Date()
    });
    return { id: docRef.id, ...gradoData };
  } catch (error) {
    console.error('Error al crear grado:', error);
    throw new Error('Error al crear grado: ' + error.message);
  }
};

export const obtenerGrados = async () => {
  try {
    const gradosRef = collection(db, 'grados');
    const q = query(gradosRef, orderBy('nivel', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const grados = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return grados;
  } catch (error) {
    console.error('Error al obtener grados:', error);
    throw error;
  }
};

export const actualizarGrado = async (id, gradoData) => {
  try {
    const gradoRef = doc(db, 'grados', id);
    await updateDoc(gradoRef, {
      ...gradoData,
      updatedAt: new Date()
    });
    return { id, ...gradoData };
  } catch (error) {
    console.error('Error al actualizar grado:', error);
    throw new Error('Error al actualizar grado: ' + error.message);
  }
};

// Eliminar un grado
export const eliminarGrado = async (gradoId) => {
  try {
    // Primero eliminar todas las relaciones con docentes
    const docentesRef = collection(db, 'grados_docentes');
    const q = query(docentesRef, where('gradoId', '==', gradoId));
    const querySnapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    
    // Eliminar todas las relaciones con docentes
    querySnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Eliminar el grado
    const gradoRef = doc(db, 'grados', gradoId);
    batch.delete(gradoRef);
    
    await batch.commit();
  } catch (error) {
    console.error('Error al eliminar grado:', error);
    throw error;
  }
};

// Funciones para Docentes
export const crearDocente = async (docenteData) => {
  try {
    const docRef = await addDoc(collection(db, 'docentes'), {
      ...docenteData,
      estado: 'activo',
      createdAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error al crear docente:', error);
    throw new Error('Error al crear el docente: ' + error.message);
  }
};

export const obtenerDocentes = async () => {
  try {
    const q = query(
      collection(db, 'docentes'),
      orderBy('nombre'),
      limit(100)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener docentes:', error);
    throw new Error('Error al obtener los docentes: ' + error.message);
  }
};

export const actualizarDocente = async (docenteId, docenteData) => {
  try {
    const docRef = doc(db, 'docentes', docenteId);
    await updateDoc(docRef, {
      ...docenteData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error al actualizar docente:', error);
    throw new Error('Error al actualizar el docente: ' + error.message);
  }
};

export const eliminarDocente = async (docenteId) => {
  try {
    const docRef = doc(db, 'docentes', docenteId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error al eliminar docente:', error);
    throw new Error('Error al eliminar el docente: ' + error.message);
  }
};

// Funciones para Encuestas
export const crearEncuesta = async (encuestaData) => {
  try {
    const docRef = await addDoc(collection(db, 'encuestas'), {
      ...encuestaData,
      estado: 'activa',
      createdAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error al crear encuesta:', error);
    throw new Error('Error al crear la encuesta: ' + error.message);
  }
};

export const obtenerEncuestas = async () => {
  try {
    const q = query(
      collection(db, 'encuestas'),
      where('estado', '==', 'activa'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener encuestas:', error);
    throw new Error('Error al obtener las encuestas: ' + error.message);
  }
};

// Obtener preguntas asociadas a una encuesta
export const obtenerPreguntasPorEncuesta = async (encuestaId) => {
  try {
    const encuestaPreguntaRef = collection(db, 'encuesta_pregunta');
    const q = query(encuestaPreguntaRef, where('encuesta_id', '==', encuestaId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw new Error('Error al obtener preguntas de la encuesta: ' + error.message);
  }
};

// Actualizar preguntas asociadas a una encuesta
export const actualizarPreguntasEncuesta = async (encuestaId, preguntaIds) => {
  try {
    const encuestaPreguntaRef = collection(db, 'encuesta_pregunta');
    // Obtener todas las relaciones actuales para esta encuesta
    const q = query(encuestaPreguntaRef, where('encuesta_id', '==', encuestaId));
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    // Crear un mapa de las relaciones actuales
    const relacionesActuales = new Map();
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      relacionesActuales.set(data.pregunta_id, doc.id);
    });
    // Eliminar relaciones que ya no existen
    for (const [preguntaId, docId] of relacionesActuales) {
      if (!preguntaIds.includes(preguntaId)) {
        const docRef = doc(encuestaPreguntaRef, docId);
        batch.delete(docRef);
      }
    }
    // Agregar nuevas relaciones
    for (const preguntaId of preguntaIds) {
      if (!relacionesActuales.has(preguntaId)) {
        const nuevaRelacion = {
          encuesta_id: encuestaId,
          pregunta_id: preguntaId,
          fecha_creacion: new Date(),
          orden: 1 // Puedes ajustar el orden si lo necesitas
        };
        const docRef = doc(collection(db, 'encuesta_pregunta'));
        batch.set(docRef, nuevaRelacion);
      }
    }
    await batch.commit();
  } catch (error) {
    throw new Error('Error al actualizar preguntas de la encuesta: ' + error.message);
  }
};

// Funciones para Preguntas
export const crearPregunta = async (preguntaData) => {
  try {
    const docRef = await addDoc(collection(db, 'preguntas'), {
      ...preguntaData,
      createdAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    throw new Error('Error al crear la pregunta: ' + error.message);
  }
};

export const obtenerPreguntas = async () => {
  try {
    const preguntasRef = collection(db, 'preguntas');
    const q = query(
      preguntasRef,
      orderBy('fecha_creacion', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw new Error('Error al obtener las preguntas: ' + error.message);
  }
};

export const actualizarPregunta = async (preguntaId, preguntaData) => {
  try {
    const docRef = doc(db, 'preguntas', preguntaId);
    await updateDoc(docRef, {
      ...preguntaData,
      fecha_actualizacion: new Date()
    });
  } catch (error) {
    throw new Error('Error al actualizar la pregunta: ' + error.message);
  }
};

export const eliminarPregunta = async (preguntaId) => {
  try {
    const docRef = doc(db, 'preguntas', preguntaId);
    await deleteDoc(docRef);
  } catch (error) {
    throw new Error('Error al eliminar la pregunta: ' + error.message);
  }
};

// Funciones para Alternativas
export const crearAlternativa = async (alternativaData) => {
  try {
    const docRef = await addDoc(collection(db, 'alternativas'), {
      ...alternativaData,
      createdAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    throw new Error('Error al crear la alternativa: ' + error.message);
  }
};

export const obtenerAlternativas = async (preguntaId) => {
  try {
    let q;
    const alternativasRef = collection(db, 'alternativas');
    if (preguntaId) {
      q = query(
        alternativasRef,
        where('preguntaId', '==', preguntaId),
        orderBy('orden')
      );
    } else {
      q = query(
        alternativasRef,
        orderBy('fecha_creacion', 'desc')
      );
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw new Error('Error al obtener las alternativas: ' + error.message);
  }
};

export const actualizarAlternativa = async (alternativaId, alternativaData) => {
  try {
    const docRef = doc(db, 'alternativas', alternativaId);
    await updateDoc(docRef, {
      ...alternativaData,
      fecha_actualizacion: new Date()
    });
  } catch (error) {
    throw new Error('Error al actualizar la alternativa: ' + error.message);
  }
};

export const eliminarAlternativa = async (alternativaId) => {
  try {
    const docRef = doc(db, 'alternativas', alternativaId);
    await deleteDoc(docRef);
  } catch (error) {
    throw new Error('Error al eliminar la alternativa: ' + error.message);
  }
};

export const obtenerEstadisticas = async () => {
  try {
    const [grados, docentes, encuestas] = await Promise.all([
      obtenerGrados(),
      obtenerDocentes(),
      obtenerEncuestas()
    ]);

    return {
      totalGrados: grados.length,
      totalDocentes: docentes.length,
      totalEncuestas: encuestas.length
    };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw new Error('Error al obtener estadísticas: ' + error.message);
  }
};

// Obtener docentes asignados a un grado
export const obtenerDocentesPorGrado = async (gradoId) => {
  try {
    console.log('Obteniendo docentes para el grado:', gradoId);
    const docentesRef = collection(db, 'grados_docentes');
    const q = query(docentesRef, where('gradoId', '==', gradoId));
    const querySnapshot = await getDocs(q);

    const docentesIds = querySnapshot.docs.map(doc => doc.data().docenteId);
    console.log('IDs de docentes encontrados:', docentesIds);

    if (docentesIds.length === 0) return [];

    // Firestore permite hasta 30 elementos en un 'in'
    const docentes = [];
    for (let i = 0; i < docentesIds.length; i += 30) {
      const batchIds = docentesIds.slice(i, i + 30);
      const docentesQuery = query(
        collection(db, 'docentes'),
        where('__name__', 'in', batchIds)
      );
      const docentesSnapshot = await getDocs(docentesQuery);
      docentes.push(...docentesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    }

    console.log('Docentes encontrados:', docentes);
    return docentes;
  } catch (error) {
    console.error('Error al obtener docentes del grado:', error);
    throw error;
  }
};

// Actualizar docentes de un grado
export const actualizarDocentesGrado = async (gradoId, docenteIds) => {
  try {
    console.log('Actualizando docentes para el grado:', gradoId);
    console.log('IDs de docentes seleccionados:', docenteIds);
    
    const batch = writeBatch(db);
    const docentesRef = collection(db, 'grados_docentes');

    // Obtener todas las relaciones actuales para este grado
    const q = query(docentesRef, where('gradoId', '==', gradoId));
    const querySnapshot = await getDocs(q);
    
    // Crear un mapa de las relaciones actuales
    const relacionesActuales = new Map();
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      relacionesActuales.set(data.docenteId, doc.id);
    });

    console.log('Relaciones actuales:', Array.from(relacionesActuales.entries()));

    // Eliminar relaciones que ya no existen
    for (const [docenteId, docId] of relacionesActuales) {
      if (!docenteIds.includes(docenteId)) {
        console.log('Eliminando relación para docente:', docenteId);
        const docRef = doc(docentesRef, docId);
        batch.delete(docRef);
      }
    }

    // Agregar nuevas relaciones
    for (const docenteId of docenteIds) {
      if (!relacionesActuales.has(docenteId)) {
        console.log('Agregando nueva relación para docente:', docenteId);
        const nuevaAsignacion = {
          gradoId,
          docenteId,
          activo: true,
          fechaCreacion: serverTimestamp()
        };
        const docRef = doc(collection(db, 'grados_docentes'));
        batch.set(docRef, nuevaAsignacion);
      }
    }

    await batch.commit();
    console.log('Actualización completada');
  } catch (error) {
    console.error('Error al actualizar docentes del grado:', error);
    throw error;
  }
}; 