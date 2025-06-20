// Script para limpiar respuestas usando Firebase CLI
// Ejecutar: node limpiarRespuestasCLI.js

const { exec } = require('child_process');

console.log('🧹 Iniciando limpieza de respuestas...');

// Comando para eliminar toda la colección respuestas
const comando = 'firebase firestore:delete respuestas --recursive --yes';

exec(comando, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error al ejecutar el comando:', error);
    return;
  }
  
  if (stderr) {
    console.error('⚠️ Advertencias:', stderr);
  }
  
  console.log('✅ Comando ejecutado exitosamente');
  console.log('📤 Salida:', stdout);
  console.log('🎉 Colección "respuestas" eliminada');
});

console.log('💡 Alternativa: También puedes ejecutar manualmente:');
console.log('   firebase firestore:delete respuestas --recursive --yes'); 