import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirestore } from 'react-firebase-hooks/firestore';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { COLECCIONES } from '../../constants/collections';

const AlternativaForm = ({ alternativaId, preguntaId }) => {
  const [texto, setTexto] = useState('');
  const [valor, setValor] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [db] = useFirestore();
  const { user } = useFirebaseAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const alternativaData = {
        texto: texto,
        valor: valor
      };

      if (alternativaId) {
        // Actualizar alternativa existente
        await updateDoc(doc(db, COLECCIONES.ALTERNATIVAS, alternativaId), alternativaData);
      } else {
        // Crear nueva alternativa
        const docRef = await addDoc(collection(db, COLECCIONES.ALTERNATIVAS), alternativaData);
        alternativaId = docRef.id;
      }

      // Crear relación pregunta-alternativa
      await addDoc(collection(db, COLECCIONES.PREGUNTA_ALTERNATIVA), {
        pregunta_id: preguntaId,
        alternativa_id: alternativaId
      });

      navigate('/admin/alternativas');
    } catch (error) {
      console.error('Error al guardar la alternativa:', error);
      setError('Error al guardar la alternativa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Renderiza el formulario de entrada */}
    </div>
  );
};

export default AlternativaForm; 