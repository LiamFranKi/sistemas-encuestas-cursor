const admin = require('firebase-admin');

// Configuración de Firebase Admin
const serviceAccount = require('./firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'encuestas-cursor'
});

const auth = admin.auth();
const db = admin.firestore();

async function autenticarUsuario(email, password, role = 'user') {
  try {
    console.log(`🔐 Autenticando usuario: ${email}`);
    
    // Crear usuario en Firebase Auth
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      emailVerified: true
    });

    console.log(`✅ Usuario creado en Auth con UID: ${userRecord.uid}`);

    // Agregar usuario a la colección users con su rol
    await db.collection('users').doc(userRecord.uid).set({
      email: email,
      role: role,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      active: true
    });

    console.log(`✅ Usuario agregado a la colección 'users' con rol: ${role}`);
    console.log(`🎉 Usuario autenticado exitosamente!`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 UID: ${userRecord.uid}`);
    console.log(`👤 Rol: ${role}`);

    return userRecord.uid;

  } catch (error) {
    console.error('❌ Error al autenticar usuario:', error);
    
    if (error.code === 'auth/email-already-exists') {
      console.log('⚠️ El usuario ya existe. Verificando en la base de datos...');
      
      try {
        // Buscar el usuario existente
        const userRecord = await auth.getUserByEmail(email);
        console.log(`✅ Usuario encontrado con UID: ${userRecord.uid}`);
        
        // Verificar si está en la colección users
        const userDoc = await db.collection('users').doc(userRecord.uid).get();
        
        if (!userDoc.exists) {
          // Agregar a la colección users si no existe
          await db.collection('users').doc(userRecord.uid).set({
            email: email,
            role: role,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            active: true
          });
          console.log(`✅ Usuario agregado a la colección 'users' con rol: ${role}`);
        } else {
          console.log(`ℹ️ Usuario ya existe en la colección 'users'`);
        }
        
        return userRecord.uid;
      } catch (getError) {
        console.error('❌ Error al obtener usuario existente:', getError);
      }
    }
    
    throw error;
  } finally {
    // Cerrar la conexión
    admin.app().delete();
  }
}

// Ejemplo de uso
// autenticarUsuario('usuario@ejemplo.com', 'password123', 'user');

module.exports = { autenticarUsuario };

// Si se ejecuta directamente
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('📝 Uso: node autenticarUsuario.js <email> <password> [role]');
    console.log('📝 Ejemplo: node autenticarUsuario.js usuario@ejemplo.com password123 user');
    process.exit(1);
  }
  
  const [email, password, role = 'user'] = args;
  autenticarUsuario(email, password, role);
} 