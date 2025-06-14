import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { COLECCIONES } from '../../constants';

const PreguntaList = () => {
  const [preguntas, setPreguntas] = useState([]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta pregunta?')) {
      try {
        // Eliminar alternativas de la pregunta
        const preguntaAlternativasRef = collection(db, COLECCIONES.PREGUNTA_ALTERNATIVA);
        const preguntaAlternativasQuery = query(preguntaAlternativasRef, where('pregunta_id', '==', id));
        const preguntaAlternativasSnapshot = await getDocs(preguntaAlternativasQuery);
        
        for (const doc of preguntaAlternativasSnapshot.docs) {
          await deleteDoc(doc(db, COLECCIONES.PREGUNTA_ALTERNATIVA, doc.id));
        }
        
        // Eliminar la pregunta
        await deleteDoc(doc(db, COLECCIONES.PREGUNTAS, id));
        setPreguntas(preguntas.filter(pregunta => pregunta.id !== id));
      } catch (error) {
        console.error('Error al eliminar la pregunta:', error);
      }
    }
  };

  useEffect(() => {
    // Fetch preguntas from Firestore
  }, []);

  return (
    <div>
      {/* Renderiza la lista de preguntas */}
    </div>
  );
};

export default PreguntaList; 