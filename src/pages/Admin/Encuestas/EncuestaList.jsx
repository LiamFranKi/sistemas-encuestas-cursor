import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { COLECCIONES } from '../../constants';

const EncuestaList = () => {
  const [encuestas, setEncuestas] = useState([]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta encuesta?')) {
      try {
        // Eliminar relaciones encuesta-pregunta
        const encuestaPreguntasRef = collection(db, COLECCIONES.ENCUESTA_PREGUNTA);
        const encuestaPreguntasQuery = query(encuestaPreguntasRef, where('encuesta_id', '==', id));
        const encuestaPreguntasSnapshot = await getDocs(encuestaPreguntasQuery);
        
        for (const doc of encuestaPreguntasSnapshot.docs) {
          const preguntaId = doc.data().preguntaId;
          
          // Eliminar alternativas de la pregunta
          const preguntaAlternativasRef = collection(db, COLECCIONES.PREGUNTA_ALTERNATIVA);
          const preguntaAlternativasQuery = query(preguntaAlternativasRef, where('pregunta_id', '==', preguntaId));
          const preguntaAlternativasSnapshot = await getDocs(preguntaAlternativasQuery);
          
          for (const altDoc of preguntaAlternativasSnapshot.docs) {
            await deleteDoc(doc(db, COLECCIONES.PREGUNTA_ALTERNATIVA, altDoc.id));
          }
          
          // Eliminar relación pregunta-encuesta
          await deleteDoc(doc(db, COLECCIONES.ENCUESTA_PREGUNTA, doc.id));
        }
        
        // Eliminar la encuesta
        await deleteDoc(doc(db, COLECCIONES.ENCUESTAS, id));
        setEncuestas(encuestas.filter(encuesta => encuesta.id !== id));
      } catch (error) {
        console.error('Error al eliminar la encuesta:', error);
      }
    }
  };

  useEffect(() => {
    // Fetch encuestas from Firestore
  }, []);

  return (
    <div>
      {/* Render encuestas list */}
    </div>
  );
};

export default EncuestaList; 