# Registro de Cambios (Changelog)

## [Resumen y Estructura del Sistema]

### Estructura General
- **Frontend:** React + MUI, estructura modular por entidades (grados, docentes, encuestas, preguntas, alternativas, usuarios, relaciones).
- **Backend:** Firebase Firestore (NoSQL), autenticación con Firebase Auth.
- **Reglas de seguridad:** Solo usuarios con claim `admin` pueden escribir en módulos críticos (grados, docentes, encuestas, preguntas, alternativas, relaciones). Los estudiantes solo pueden leer y responder encuestas.
- **Relaciones:**
  - `grados_docentes`: Relaciona grados con docentes.
  - `encuesta_pregunta`: Relaciona encuestas con preguntas.
  - `pregunta_alternativa`: Relaciona preguntas con alternativas.
- **Panel de administración:** Solo accesible para usuarios autenticados con claim `admin`.
- **Asignación de claims:** Se realiza con script Node.js usando el SDK de Firebase Admin.

### Flujos principales
- **Administradores:** Pueden crear, editar y eliminar grados, docentes, preguntas, alternativas, encuestas y relaciones.
- **Estudiantes:** Solo pueden responder encuestas activas.
- **Sincronización:** Al asignar docentes a un grado, el diálogo muestra marcados los docentes ya relacionados (optimizado para rendimiento).

### Decisiones y mejoras recientes
- Optimización de la consulta de docentes por grado usando `where('__name__', 'in', [...])` para mayor velocidad.
- Corrección de reglas de seguridad para producción: solo admin puede escribir.
- Documentación de cómo asignar claims de admin y cómo manejar roles personalizados.
- Limpieza de campos innecesarios (`activo`) y scripts de mantenimiento.
- Commit de todos los cambios importantes tras cada mejora.

### Próximos pasos sugeridos
- Implementar panel de administración para asignar roles/claims desde la web.
- Mejorar la gestión de roles personalizados (ej: director, editor, etc).
- Mantener este changelog actualizado tras cada cambio relevante.

## [No Versionado]

### 2024-03-19
- **feat**: Commit inicial del sistema completo de encuestas
  - Primer commit que incluye toda la estructura y archivos del sistema de encuestas educativo

- **docs**: Actualización completa del README con la lógica de negocio detallada del sistema de encuestas
  - Detalle de la estructura del proyecto
  - Descripción de la lógica de negocio
  - Flujo de la encuesta para estudiantes
  - Relaciones entre módulos
  - Próximos pasos del desarrollo

### Notas Importantes
- El sistema está en desarrollo activo
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