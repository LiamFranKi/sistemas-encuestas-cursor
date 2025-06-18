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
        // Obtener preguntas de la encuesta (solo las asociadas a esta encuesta)
        const preguntasQuery = query(
          collection(db, 'encuesta_pregunta'),
          where('encuesta_id', '==', encuestaDoc.id)
        );
        const preguntasSnapshot = await getDocs(preguntasQuery);
        const totalPreguntas = preguntasSnapshot.size;
        // Obtener docentes posibles de la encuesta (todos los posibles)
        const totalDocentes = await obtenerDocentesPorEncuesta(encuestaDoc.id);
        // Obtener docentes respondidos (únicos en respuestas)
        const docentesRespondidosSet = new Set();
        respuestasSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.docente_id) {
            docentesRespondidosSet.add(data.docente_id);
          }
        });
        const totalDocentesRespondidos = docentesRespondidosSet.size;
        const totalRespuestas = respuestasSnapshot.size;
        // Participantes = totalRespuestas / (totalPreguntas * totalDocentesRespondidos)
        const divisor = totalPreguntas > 0 && totalDocentesRespondidos > 0 ? (totalPreguntas * totalDocentesRespondidos) : 1;
        const participantes = Math.round(totalRespuestas / divisor);
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
          totalRespuestas,
          totalPreguntas,
          totalDocentes,
          totalDocentesRespondidos,
          participantes,
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
        // Obtener encuesta activa (o puedes adaptar para otra encuesta específica)
        const encuestasQuery = query(collection(db, 'encuestas'), where('estado', '==', 'activa'));
        const encuestasSnapshot = await getDocs(encuestasQuery);
        let totalPreguntas = 0;
        let totalDocentes = 0;
        if (!encuestasSnapshot.empty) {
          const encuestaId = encuestasSnapshot.docs[0].id;
          // Preguntas solo de esta encuesta
          const preguntasQuery = query(
            collection(db, 'encuesta_pregunta'),
            where('encuesta_id', '==', encuestaId)
          );
          const preguntasSnapshot = await getDocs(preguntasQuery);
          totalPreguntas = preguntasSnapshot.size;
          // Docentes solo de este grado
          totalDocentes = await obtenerDocentesPorGrado(gradoDoc.id);
        }
        const totalRespuestas = respuestasSnapshot.size;
        const divisor = totalPreguntas > 0 && totalDocentes > 0 ? (totalPreguntas * totalDocentes) : 1;
        const participantes = Math.round(totalRespuestas / divisor);
        return {
          id: gradoDoc.id,
          nombre: grado.nombre,
          nivel: grado.nivel,
          totalRespuestas,
          totalPreguntas,
          totalDocentes,
          participantes
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

// Obtener docentes únicos de una encuesta
export const obtenerDocentesPorEncuesta = async (encuestaId) => {
  try {
    // 1. Obtener todas las preguntas de la encuesta
    const preguntasQuery = query(
      collection(db, 'encuesta_pregunta'),
      where('encuesta_id', '==', encuestaId)
    );
    const preguntasSnapshot = await getDocs(preguntasQuery);
    if (preguntasSnapshot.empty) return 0;

    // 2. Obtener todos los grados asociados a esas preguntas (si la pregunta tiene grado_id, si no, debes adaptar esto)
    // Suponiendo que cada pregunta tiene un grado_id (si no, deberás adaptar la lógica)
    // Si no hay grado_id en la pregunta, deberás obtener los grados de otra forma
    // Aquí asumimos que cada pregunta está asociada a un grado
    // Si no es así, por favor dime cómo se relacionan
    // const gradoIds = [...new Set(preguntasSnapshot.docs.map(doc => doc.data().grado_id))].filter(Boolean);
    // Como no se ve grado_id en la imagen, asumimos que la encuesta está asociada a todos los grados
    // Por ahora, obtendremos todos los docentes del sistema (esto se puede mejorar si tienes la relación)

    // 3. Obtener todos los docentes de todos los grados (sin duplicados)
    const gradosDocentesSnapshot = await getDocs(collection(db, 'grados_docentes'));
    const docentesSet = new Set();
    gradosDocentesSnapshot.forEach(doc => {
      docentesSet.add(doc.data().docenteId);
    });
    return docentesSet.size;
  } catch (error) {
    console.error('Error al obtener docentes por encuesta:', error);
    return 0;
  }
};

// Obtener docentes de un grado
export const obtenerDocentesPorGrado = async (gradoId) => {
  try {
    const gradosDocentesQuery = query(
      collection(db, 'grados_docentes'),
      where('gradoId', '==', gradoId)
    );
    const gradosDocentesSnapshot = await getDocs(gradosDocentesQuery);
    const docentesSet = new Set();
    gradosDocentesSnapshot.forEach(doc => {
      docentesSet.add(doc.data().docenteId);
    });
    return docentesSet.size;
  } catch (error) {
    console.error('Error al obtener docentes por grado:', error);
    return 0;
  }
};

// Obtener estadísticas por docente
export const obtenerEstadisticasPorDocente = async () => {
  try {
    // Obtener todos los docentes
    const docentesSnapshot = await getDocs(collection(db, 'docentes'));
    
    // Obtener encuesta activa
    const encuestasQuery = query(collection(db, 'encuestas'), where('estado', '==', 'activa'));
    const encuestasSnapshot = await getDocs(encuestasQuery);
    
    if (encuestasSnapshot.empty) {
      return [];
    }
    
    const encuestaId = encuestasSnapshot.docs[0].id;
    
    // Obtener preguntas de la encuesta activa
    const preguntasQuery = query(
      collection(db, 'encuesta_pregunta'),
      where('encuesta_id', '==', encuestaId)
    );
    const preguntasSnapshot = await getDocs(preguntasQuery);
    const preguntasIds = preguntasSnapshot.docs.map(doc => doc.data().pregunta_id);
    
    // Obtener textos de las preguntas y sus tipos
    const preguntasInfo = {};
    for (const preguntaId of preguntasIds) {
      const preguntaDoc = await getDocs(query(collection(db, 'preguntas'), where('__name__', '==', preguntaId)));
      if (!preguntaDoc.empty) {
        const preguntaData = preguntaDoc.docs[0].data();
        preguntasInfo[preguntaId] = {
          texto: preguntaData.texto_pregunta,
          tipo: preguntaData.tipo_pregunta || 'general'
        };
      }
    }
    
    const estadisticas = await Promise.all(
      docentesSnapshot.docs.map(async (docenteDoc) => {
        const docente = docenteDoc.data();
        
        // Obtener respuestas de este docente
        const respuestasQuery = query(
          collection(db, 'respuestas'),
          where('docente_id', '==', docenteDoc.id)
        );
        const respuestasSnapshot = await getDocs(respuestasQuery);
        
        const totalRespuestas = respuestasSnapshot.size;
        const totalPreguntas = preguntasIds.length;
        
        // Calcular estadísticas por tipo de pregunta
        const estadisticasPorTipo = {};
        const alternativasPorPregunta = {};
        
        // Inicializar contadores por tipo
        Object.values(preguntasInfo).forEach(pregunta => {
          const tipo = pregunta.tipo;
          if (!estadisticasPorTipo[tipo]) {
            estadisticasPorTipo[tipo] = {
              totalPreguntas: 0,
              totalRespuestas: 0,
              preguntas: []
            };
          }
          estadisticasPorTipo[tipo].totalPreguntas++;
        });
        
        // Procesar respuestas
        respuestasSnapshot.docs.forEach(respDoc => {
          const resp = respDoc.data();
          const preguntaId = resp.pregunta_id;
          const alternativaId = resp.alternativa_id;
          
          if (preguntasInfo[preguntaId]) {
            const tipo = preguntasInfo[preguntaId].tipo;
            estadisticasPorTipo[tipo].totalRespuestas++;
            
            if (!estadisticasPorTipo[tipo].preguntas.includes(preguntaId)) {
              estadisticasPorTipo[tipo].preguntas.push(preguntaId);
            }
          }
          
          // Contar alternativas por pregunta
          if (!alternativasPorPregunta[preguntaId]) {
            alternativasPorPregunta[preguntaId] = {};
          }
          if (!alternativasPorPregunta[preguntaId][alternativaId]) {
            alternativasPorPregunta[preguntaId][alternativaId] = 0;
          }
          alternativasPorPregunta[preguntaId][alternativaId]++;
        });
        
        // Obtener textos de las alternativas más seleccionadas
        const alternativasMasSeleccionadas = {};
        for (const [preguntaId, alternativas] of Object.entries(alternativasPorPregunta)) {
          const alternativaMasVotada = Object.entries(alternativas).reduce((a, b) => 
            alternativas[a[0]] > alternativas[b[0]] ? a : b
          );
          
          // Obtener texto de la alternativa
          const alternativaDoc = await getDocs(query(
            collection(db, 'pregunta_alternativa'),
            where('pregunta_id', '==', preguntaId),
            where('alternativa_id', '==', alternativaMasVotada[0])
          ));
          
          let textoAlternativa = alternativaMasVotada[0];
          if (!alternativaDoc.empty) {
            textoAlternativa = alternativaDoc.docs[0].data().texto_alternativa || alternativaMasVotada[0];
          }
          
          alternativasMasSeleccionadas[preguntaId] = {
            alternativaId: alternativaMasVotada[0],
            texto: textoAlternativa,
            cantidad: alternativaMasVotada[1]
          };
        }
        
        // Calcular promedio de respuestas por pregunta
        const promedioRespuestas = totalPreguntas > 0 ? (totalRespuestas / totalPreguntas).toFixed(2) : 0;
        
        return {
          id: docenteDoc.id,
          nombre: docente.nombre,
          apellido: docente.apellido,
          nombreCompleto: `${docente.nombre} ${docente.apellido}`,
          totalRespuestas,
          totalPreguntas,
          promedioRespuestas: parseFloat(promedioRespuestas),
          estadisticasPorTipo,
          alternativasMasSeleccionadas,
          grado: docente.grado || 'No asignado'
        };
      })
    );
    
    // Ordenar por nombre completo
    return estadisticas.sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto));
  } catch (error) {
    console.error('Error al obtener estadísticas por docente:', error);
    throw error;
  }
}; 