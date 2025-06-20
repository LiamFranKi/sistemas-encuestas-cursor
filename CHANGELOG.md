# Registro de Cambios (Changelog)

## [Resumen y Estructura del Sistema]

### Estructura General
- **Frontend:** React + MUI, estructura modular por entidades (grados, docentes, encuestas, preguntas, alternativas, usuarios, relaciones).
- **Backend:** Firebase Firestore (NoSQL), autenticación con Firebase Auth.
- **Sistema de Roles:**
  - **`admin`**: Acceso completo a todos los módulos de mantenimiento y estadísticas.
  - **`user`**: Acceso de solo lectura al módulo de **Estadísticas**.
- **Lógica de Roles:** Implementada a través de `RoleContext.js`, que lee el campo `role` de la colección `users` en Firestore.
- **Reglas de seguridad:** Solo usuarios con claim `admin` pueden escribir en módulos críticos (grados, docentes, encuestas, preguntas, alternativas, relaciones). Los estudiantes solo pueden leer y responder encuestas.
- **Relaciones:**
  - `grados_docentes`: Relaciona grados con docentes.
  - `encuesta_pregunta`: Relaciona encuestas con preguntas.
  - `pregunta_alternativa`: Relaciona preguntas con alternativas.
- **Panel de administración:** Menú dinámico que se adapta según el rol del usuario.
- **Asignación de roles:** Se gestiona a través de la colección `users` en Firestore y se puede automatizar con el script `autenticarUsuario.js`.

### Flujos principales
- **Administradores:** Pueden crear, editar y eliminar todas las entidades del sistema.
- **Usuarios (Rol `user`):** Pueden iniciar sesión y ver exclusivamente el panel de estadísticas.
- **Estudiantes (No autenticados):** Solo pueden responder encuestas activas a través de la página de inicio.
- **Sincronización:** Al asignar docentes a un grado, el diálogo muestra marcados los docentes ya relacionados (optimizado para rendimiento).

### Decisiones y mejoras recientes
- Implementación de un sistema de roles desacoplado que no requiere claims de Firebase para roles de solo lectura, simplificando la gestión.
- Optimización de la consulta de docentes por grado usando `where('__name__', 'in', [...])` para mayor velocidad.
- Corrección de reglas de seguridad para producción: solo admin puede escribir.
- Documentación completa del proceso de deploy, limpieza de datos y configuración de seguridad.
- Limpieza de campos innecesarios (`activo`) y scripts de mantenimiento.
- Commit de todos los cambios importantes tras cada mejora.

### Próximos pasos sugeridos
- Implementar un panel de administración para gestionar roles de usuarios desde la interfaz web.
- Mejorar la gestión de roles personalizados (ej: director, editor, etc).
- Mantener este changelog actualizado tras cada cambio relevante.

## [Historial de Cambios]

### 2024-12-19 - Sistema de Roles y Permisos
- **feat(auth)**: Implementación de sistema de roles y permisos.
  - **`RoleContext.js`**: Nuevo contexto para gestionar el rol del usuario (`admin`, `user`) leyéndolo desde Firestore.
  - **Integración**: `RoleProvider` envuelve la aplicación en `App.js` para proveer el contexto de rol globalmente.
  - **`DashboardLayout.jsx`**: Modificado para mostrar un menú dinámico basado en el rol del usuario.
    - **Rol `admin`**: Ve todos los módulos de mantenimiento y estadísticas.
    - **Rol `user`**: Solo puede ver el módulo de **Estadísticas** y cerrar sesión.
  - **Redirección automática**: Usuarios con rol `user` que intenten acceder a rutas de administrador son redirigidos a `/estadisticas`.
  - **`autenticarUsuario.js`**: Nuevo script para crear y autenticar usuarios en Firebase Auth y registrarlos en la colección `users` de Firestore con un rol específico.

### 2024-12-19 - Deploy a Producción y Configuración de Seguridad
- **🚀 feat**: Deploy exitoso a Firebase Hosting
  - URL de producción: https://encuestas-cursor.web.app
  - Configuración de hosting en firebase.json
  - Build optimizado para producción
  - SPA routing configurado correctamente

- **🔒 security**: Configuración de seguridad de API Key
  - Eliminación de credenciales sensibles del repositorio
  - Actualización de .gitignore para archivos de Firebase
  - Limpieza del historial de Git con git filter-branch
  - Documentación de restricciones de API Key en RESTRICCIONES_API.md

- **📊 feat**: Sistema completo de exportación de estadísticas
  - Exportación a Excel con formato profesional y colores
  - Exportación a PDF con diseño centrado y estilos
  - Estadísticas detalladas por pregunta con tabla cruzada
  - Ranking individual por alternativa
  - Estadísticas generales por alternativas
  - Integración en ambos tabs (Por Encuesta y Por Grado)

### 2024-12-19 - Funcionalidades de Estadísticas Avanzadas
- **📈 feat**: Estadísticas por pregunta detalladas
  - Tabla cruzada: Docente x Alternativa por cada pregunta
  - Estadísticas generales por alternativas (todos los docentes del grado)
  - Tabla cruzada: Docentes vs Alternativas
  - Ranking individual por alternativa con posiciones
  - Formato profesional con colores y estilos

- **🎨 style**: Mejoras de formato en exportaciones
  - Colores azul (#308BE7) para encabezados
  - Colores verde (#43A047) para totales
  - Datos centrados en todas las celdas
  - Bordes y formato consistente
  - Ancho de columnas optimizado

### 2024-12-19 - Integración y Limpieza de Código
- **🔧 fix**: Corrección de errores de Grid v2 de Material UI
  - Actualización de props Grid a nueva sintaxis
  - Eliminación de warnings de React DevTools
  - Limpieza de imports no utilizados

- **🔒 feat**: Sistema de restricción de acceso con localStorage
  - Bloqueo de encuestas después de completarlas
  - Marcado de completado solo al llegar a página de agradecimiento
  - Mejora de UX evitando bloqueos prematuras

### 2024-12-19 - Mejoras en Estadísticas
- **📊 feat**: Implementación de estadísticas cruzadas
  - Tabla cruzada por pregunta, docente y alternativa
  - Estadísticas por pregunta con texto de alternativas
  - Limpieza visual y mejoras en la presentación

- **🎯 feat**: Consolidación de funcionalidades
  - Versión final de estadísticas con limpieza de tabs
  - Eliminación de tab "Por Docente" innecesario
  - Optimización de componentes y rendimiento

### 2024-03-19
- **feat**: Commit inicial del sistema completo de encuestas
  - Primer commit que incluye toda la estructura y archivos del sistema de encuestas educativo

- **docs**: Actualización completa del README con la lógica de negocio detallada del sistema de encuestas
  - Detalle de la estructura del proyecto
  - Descripción de la lógica de negocio
  - Flujo de la encuesta para estudiantes
  - Relaciones entre módulos
  - Próximos pasos del desarrollo

## 🔗 Enlaces Importantes

### Producción
- **URL de la aplicación**: https://encuestas-cursor.web.app
- **Firebase Console**: https://console.firebase.google.com/project/encuestas-cursor/overview
- **Google Cloud Console**: https://console.cloud.google.com/apis/credentials?project=encuestas-cursor

### Repositorio
- **GitHub**: https://github.com/LiamFranKi/sistemas-encuestas-cursor

### Configuración de Seguridad
- **API Key**: AIzaSyCYOC4u5EUGCi8n8iFMTy-JXYVlCZj4CjA
- **Restricciones necesarias**: Ver RESTRICCIONES_API.md
- **URLs permitidas**:
  - https://encuestas-cursor.web.app/*
  - https://localhost:3000/*
  - https://127.0.0.1:3000/*

## 📋 Notas Importantes
- El sistema está en producción y funcionando correctamente
- Se mantiene un registro de commits importantes en este archivo
- Cada commit significativo debe ser documentado aquí con:
  - Fecha
  - Tipo de cambio (feat, fix, docs, etc.)
  - Descripción breve
  - Detalles relevantes si es necesario

### Convención de Commits
- **feat**: Nueva característica
- **fix**: Corrección de errores
- **docs**: Cambios en documentación
- **style**: Cambios que no afectan el código (espacios en blanco, formato, etc.)
- **refactor**: Cambios en el código que no corrigen errores ni añaden funcionalidades
- **perf**: Cambios que mejoran el rendimiento
- **test**: Añadir o corregir pruebas
- **chore**: Cambios en el proceso de build o herramientas auxiliares
- **security**: Cambios relacionados con seguridad 