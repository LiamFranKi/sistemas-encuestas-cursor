import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, deleteField } from 'firebase/firestore';
import { db } from '../../config/firebase';

const LimpiezaGradosDocentes = () => {
  const [resultado, setResultado] = useState('');

  useEffect(() => {
    const limpiar = async () => {
      let count = 0;
      const gradosDocentesRef = collection(db, 'grados_docentes');
      const snapshot = await getDocs(gradosDocentesRef);
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.hasOwnProperty('activo')) {
          await updateDoc(doc(db, 'grados_docentes', docSnap.id), {
            activo: deleteField()
          });
          count++;
        }
      }
      setResultado(`Campo 'activo' eliminado de ${count} documentos.`);
    };
    limpiar();
  }, []);

  return (
    <div>
      <h2>Limpieza de grados_docentes</h2>
      <p>{resultado}</p>
    </div>
  );
};

export default LimpiezaGradosDocentes; 