import { db } from '../config/firebase';
import { collection, query, where, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';

// Obtener todas las alternativas
export const getAlternativas = async () => {
  const snapshot = await getDocs(collection(db, 'alternativas'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Obtener alternativas asignadas a una pregunta
export const getAlternativasByPregunta = async (preguntaId) => {
  const q = query(collection(db, 'pregunta_alternativa'), where('pregunta_id', '==', preguntaId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Asignar alternativas a una pregunta (sobrescribe las existentes)
export const setAlternativasToPregunta = async (preguntaId, alternativasIds) => {
  // Elimina las relaciones actuales
  const actuales = await getAlternativasByPregunta(preguntaId);
  await Promise.all(
    actuales.map(rel => deleteDoc(doc(db, 'pregunta_alternativa', rel.id)))
  );
  // Crea las nuevas relaciones
  await Promise.all(
    alternativasIds.map((alternativaId, idx) =>
      setDoc(doc(collection(db, 'pregunta_alternativa')), {
        pregunta_id: preguntaId,
        alternativa_id: alternativaId,
        orden: idx + 1,
        fecha_creacion: new Date()
      })
    )
  );
}; 