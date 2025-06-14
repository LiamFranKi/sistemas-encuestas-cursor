import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, doc, getDocs, query, where, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { COLECCIONES } from '../../constants';

const EncuestaForm = () => {
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [activa, setActiva] = useState(true);
  const [encuestaId, setEncuestaId] = useState('');
  const [preguntas, setPreguntas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const encuestaData = {
        titulo: titulo,
        descripcion: descripcion,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        activa: activa
      };

      if (encuestaId) {
        // Actualizar encuesta existente
        await updateDoc(doc(db, COLECCIONES.ENCUESTAS, encuestaId), encuestaData);
        
        // Eliminar relaciones existentes
        const encuestaPreguntasRef = collection(db, COLECCIONES.ENCUESTA_PREGUNTA);
        const encuestaPreguntasQuery = query(encuestaPreguntasRef, where('encuesta_id', '==', encuestaId));
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
      } else {
        // Crear nueva encuesta
        const docRef = await addDoc(collection(db, COLECCIONES.ENCUESTAS), encuestaData);
        encuestaId = docRef.id;
      }

      // Crear nuevas relaciones
      for (const pregunta of preguntas) {
        const preguntaRef = await addDoc(collection(db, COLECCIONES.PREGUNTAS), {
          texto: pregunta.texto,
          tipo: pregunta.tipo
        });

        // Crear relación encuesta-pregunta
        await addDoc(collection(db, COLECCIONES.ENCUESTA_PREGUNTA), {
          encuesta_id: encuestaId,
          pregunta_id: preguntaRef.id
        });

        // Crear alternativas
        for (const alternativa of pregunta.alternativas) {
          const alternativaRef = await addDoc(collection(db, COLECCIONES.ALTERNATIVAS), {
            texto: alternativa.texto,
            valor: alternativa.valor
          });

          // Crear relación pregunta-alternativa
          await addDoc(collection(db, COLECCIONES.PREGUNTA_ALTERNATIVA), {
            pregunta_id: preguntaRef.id,
            alternativa_id: alternativaRef.id
          });
        }
      }

      navigate('/admin/encuestas');
    } catch (error) {
      console.error('Error al guardar la encuesta:', error);
      setError('Error al guardar la encuesta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Render your form here */}
    </div>
  );
};

export default EncuestaForm; 