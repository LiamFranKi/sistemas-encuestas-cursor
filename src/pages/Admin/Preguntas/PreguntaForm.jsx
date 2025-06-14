import React, { useState } from 'react';
import { useFirebase } from '../../contexts/FirebaseContext';
import { useNavigate } from 'react-router-dom';
import { collection, doc, getDocs, query, where, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { COLECCIONES } from '../../constants/collections';

const PreguntaForm = () => {
  const { db } = useFirebase();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [texto, setTexto] = useState('');
  const [tipo, setTipo] = useState('');
  const [preguntaId, setPreguntaId] = useState('');
  const [alternativas, setAlternativas] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const preguntaData = {
        texto: texto,
        tipo: tipo
      };

      if (preguntaId) {
        // Actualizar pregunta existente
        await updateDoc(doc(db, COLECCIONES.PREGUNTAS, preguntaId), preguntaData);
        
        // Eliminar alternativas existentes
        const preguntaAlternativasRef = collection(db, COLECCIONES.PREGUNTA_ALTERNATIVA);
        const preguntaAlternativasQuery = query(preguntaAlternativasRef, where('preguntaId', '==', preguntaId));
        const preguntaAlternativasSnapshot = await getDocs(preguntaAlternativasQuery);
        
        for (const doc of preguntaAlternativasSnapshot.docs) {
          await deleteDoc(doc(db, COLECCIONES.PREGUNTA_ALTERNATIVA, doc.id));
        }
      } else {
        // Crear nueva pregunta
        const docRef = await addDoc(collection(db, COLECCIONES.PREGUNTAS), preguntaData);
        preguntaId = docRef.id;
      }

      // Crear alternativas
      for (const alternativa of alternativas) {
        const alternativaRef = await addDoc(collection(db, COLECCIONES.ALTERNATIVAS), {
          texto: alternativa.texto,
          valor: alternativa.valor
        });

        // Crear relación pregunta-alternativa
        await addDoc(collection(db, COLECCIONES.PREGUNTA_ALTERNATIVA), {
          pregunta_id: preguntaId,
          alternativa_id: alternativaRef.id
        });
      }

      navigate('/admin/preguntas');
    } catch (error) {
      console.error('Error al guardar la pregunta:', error);
      setError('Error al guardar la pregunta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Render your form components here */}
    </div>
  );
};

export default PreguntaForm; 