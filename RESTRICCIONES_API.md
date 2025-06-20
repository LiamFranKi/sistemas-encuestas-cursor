# 🔒 Restricciones de Seguridad para Firebase API Key

## Pasos para restringir tu API Key:

### 1. Ir a Google Cloud Console
- URL: https://console.cloud.google.com/apis/credentials
- Proyecto: encuestas-cursor

### 2. Encontrar tu API Key
- Buscar: `AIzaSyCYOC4u5EUGCi8n8iFMTy-JXYVlCZj4CjA`
- Hacer clic para editar

### 3. Agregar restricciones:

#### A. Restricción de aplicaciones (HTTP referrers):
```
https://encuestas-cursor.web.app/*
https://localhost:3000/*
https://127.0.0.1:3000/*
```

#### B. Restricción de APIs:
- ✅ Firebase Authentication API
- ✅ Cloud Firestore API
- ✅ Firebase Hosting API
- ❌ Deshabilitar APIs que no uses

### 4. Guardar cambios

## ¿Por qué es seguro?
- ✅ Las claves de Firebase están diseñadas para ser públicas
- ✅ Las restricciones evitan uso malicioso
- ✅ Tu aplicación seguirá funcionando normalmente
- ✅ Mayor seguridad para tu proyecto

## URLs de tu aplicación:
- Producción: https://encuestas-cursor.web.app
- Desarrollo: http://localhost:3000 