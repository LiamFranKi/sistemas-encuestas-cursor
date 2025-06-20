const admin = require('firebase-admin');

// Configuración de Firebase Admin
const serviceAccount = require('./firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'encuestas-cursor'
});

const db = admin.firestore();

async function limpiarRespuestas() {
  try {
    console.log('🔍 Buscando documentos en la colección "respuestas"...');
    
    // Obtener todos los documentos de la colección respuestas
    const snapshot = await db.collection('respuestas').get();
    
    if (snapshot.empty) {
      console.log('✅ La colección "respuestas" ya está vacía');
      return;
    }
    
    console.log(`📊 Encontrados ${snapshot.size} documentos para eliminar`);
    
    // Procesar en lotes de 500 documentos
    const batchSize = 500;
    const docs = snapshot.docs;
    let totalEliminados = 0;
    
    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = db.batch();
      const lote = docs.slice(i, i + batchSize);
      
      lote.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      console.log(`🗑️ Eliminando lote ${Math.floor(i / batchSize) + 1}...`);
      await batch.commit();
      totalEliminados += lote.length;
    }
    
    console.log('✅ Colección "respuestas" limpiada exitosamente');
    console.log(`📈 Total de documentos eliminados: ${totalEliminados}`);
    
  } catch (error) {
    console.error('❌ Error al limpiar respuestas:', error);
  } finally {
    // Cerrar la conexión
    admin.app().delete();
  }
}

// Ejecutar la función
limpiarRespuestas(); 