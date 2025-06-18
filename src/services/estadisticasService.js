import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

// Obtener estadísticas generales de encuestas
export const obtenerEstadisticasGenerales = async () => {
  try {
    const [encuestasSnapshot, respuestasSnapshot] = await Promise.all([
      getDocs(collection(db, 'encuestas')),
      getDocs(collection(db, 'respuestas'))
    ]);

    const totalEncuestas = encuestasSnapshot.size;
    const totalRespuestas = respuestasSnapshot.size;
    const encuestasActivas = encuestasSnapshot.docs.filter(doc => doc.data().estado === 'activa').length;

    // Obtener totales de grados, docentes y preguntas
    const [gradosSnapshot, docentesSnapshot, preguntasSnapshot] = await Promise.all([
      getDocs(collection(db, 'grados')),
      getDocs(collection(db, 'docentes')),
      getDocs(collection(db, 'preguntas'))
    ]);
    const totalGrados = gradosSnapshot.size;
    const totalDocentes = docentesSnapshot.size;
    const totalPreguntas = preguntasSnapshot.size;

    return {
      totalEncuestas,
      totalRespuestas,
      encuestasActivas,
      totalGrados,
      totalDocentes,
      totalPreguntas
    };
  } catch (error) {
    console.error('Error al obtener estadísticas generales:', error);
    throw error;
  }
};

// Obtener estadísticas por encuesta
export const obtenerEstadisticasPorEncuesta = async () => {
  try {
    const encuestasRef = collection(db, 'encuestas');
    const encuestasSnapshot = await getDocs(encuestasRef);
    
    const estadisticas = await Promise.all(
      encuestasSnapshot.docs.map(async (encuestaDoc) => {
        const encuesta = encuestaDoc.data();
        const respuestasQuery = query(
          collection(db, 'respuestas'),
          where('encuesta_id', '==', encuestaDoc.id)
        );
        const respuestasSnapshot = await getDocs(respuestasQuery);
        
        let fechaCreacion = new Date();
        if (encuesta.createdAt) {
          if (typeof encuesta.createdAt.toDate === 'function') {
            fechaCreacion = encuesta.createdAt.toDate();
          } else if (typeof encuesta.createdAt === 'string' || typeof encuesta.createdAt === 'number') {
            fechaCreacion = new Date(encuesta.createdAt);
          } else if (encuesta.createdAt instanceof Date) {
            fechaCreacion = encuesta.createdAt;
          }
        }
        return {
          id: encuestaDoc.id,
          titulo: encuesta.titulo,
          totalRespuestas: respuestasSnapshot.size,
          estado: encuesta.estado,
          fechaCreacion
        };
      })
    );

    return estadisticas.sort((a, b) => b.fechaCreacion - a.fechaCreacion);
  } catch (error) {
    console.error('Error al obtener estadísticas por encuesta:', error);
    throw error;
  }
};

// Obtener estadísticas por grado
export const obtenerEstadisticasPorGrado = async () => {
  try {
    const gradosRef = collection(db, 'grados');
    const gradosSnapshot = await getDocs(gradosRef);
    
    const estadisticas = await Promise.all(
      gradosSnapshot.docs.map(async (gradoDoc) => {
        const grado = gradoDoc.data();
        const respuestasQuery = query(
          collection(db, 'respuestas'),
          where('grado_id', '==', gradoDoc.id)
        );
        const respuestasSnapshot = await getDocs(respuestasQuery);
        
        return {
          id: gradoDoc.id,
          nombre: grado.nombre,
          nivel: grado.nivel,
          totalRespuestas: respuestasSnapshot.size
        };
      })
    );

    return estadisticas.sort((a, b) => {
      if (a.nivel !== b.nivel) return a.nivel - b.nivel;
      return a.nombre.localeCompare(b.nombre);
    });
  } catch (error) {
    console.error('Error al obtener estadísticas por grado:', error);
    throw error;
  }
};

// Obtener estadísticas por pregunta
export const obtenerEstadisticasPorPregunta = async (encuestaId) => {
  try {
    const preguntasQuery = query(
      collection(db, 'preguntas'),
      where('encuesta_id', '==', encuestaId)
    );
    const preguntasSnapshot = await getDocs(preguntasQuery);
    
    const estadisticas = await Promise.all(
      preguntasSnapshot.docs.map(async (preguntaDoc) => {
        const pregunta = preguntaDoc.data();
        const respuestasQuery = query(
          collection(db, 'respuestas'),
          where('pregunta_id', '==', preguntaDoc.id)
        );
        const respuestasSnapshot = await getDocs(respuestasQuery);
        
        // Obtener distribución de alternativas
        const alternativasQuery = query(
          collection(db, 'pregunta_alternativa'),
          where('pregunta_id', '==', preguntaDoc.id)
        );
        const alternativasSnapshot = await getDocs(alternativasQuery);
        
        const distribucionAlternativas = {};
        alternativasSnapshot.docs.forEach(altDoc => {
          const alt = altDoc.data();
          distribucionAlternativas[altDoc.id] = {
            texto: alt.texto_alternativa,
            total: 0
          };
        });
        
        respuestasSnapshot.docs.forEach(respDoc => {
          const resp = respDoc.data();
          if (distribucionAlternativas[resp.alternativa_id]) {
            distribucionAlternativas[resp.alternativa_id].total++;
          }
        });
        
        return {
          id: preguntaDoc.id,
          texto: pregunta.texto_pregunta,
          totalRespuestas: respuestasSnapshot.size,
          distribucionAlternativas: Object.values(distribucionAlternativas)
        };
      })
    );

    return estadisticas;
  } catch (error) {
    console.error('Error al obtener estadísticas por pregunta:', error);
    throw error;
  }
}; 