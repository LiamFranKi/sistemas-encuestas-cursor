import React, { useState } from 'react';
import { collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { COLECCIONES } from '../../constants';

const AlternativaList = () => {
  const [alternativas, setAlternativas] = useState([]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta alternativa?')) {
      try {
        // Eliminar relación pregunta-alternativa
        const preguntaAlternativasRef = collection(db, COLECCIONES.PREGUNTA_ALTERNATIVA);
        const preguntaAlternativasQuery = query(preguntaAlternativasRef, where('alternativa_id', '==', id));
        const preguntaAlternativasSnapshot = await getDocs(preguntaAlternativasQuery);
        
        for (const doc of preguntaAlternativasSnapshot.docs) {
          await deleteDoc(doc(db, COLECCIONES.PREGUNTA_ALTERNATIVA, doc.id));
        }
        
        // Eliminar la alternativa
        await deleteDoc(doc(db, COLECCIONES.ALTERNATIVAS, id));
        setAlternativas(alternativas.filter(alternativa => alternativa.id !== id));
      } catch (error) {
        console.error('Error al eliminar la alternativa:', error);
      }
    }
  };

  return (
    <div>
      {/* Renderiza la lista de alternativas */}
    </div>
  );
};

export default AlternativaList; 