# Sistema de Encuestas Educativas

## Descripción General
Sistema de gestión de encuestas educativas desarrollado con React y Firebase, diseñado para facilitar la evaluación de docentes por parte de los estudiantes. El sistema permite la creación y administración de encuestas personalizadas por grado, con un enfoque en la evaluación docente.

## Tecnologías Principales
- **Frontend**: React.js
- **Backend**: Firebase
  - Authentication
  - Firestore Database
  - Analytics
- **UI Framework**: Material-UI (MUI)
- **Routing**: React Router

## Estructura del Proyecto
```
src/
├── components/         # Componentes de la aplicación
│   ├── Auth/          # Componentes de autenticación
│   ├── Dashboard/     # Panel principal
│   ├── Docentes/      # Gestión de docentes
│   ├── Encuestas/     # Gestión de encuestas
│   ├── Grados/        # Gestión de grados
│   ├── Layout/        # Componentes de diseño
│   ├── Preguntas/     # Gestión de preguntas
│   ├── Alternativas/  # Gestión de alternativas
│   ├── Usuarios/      # Gestión de usuarios
│   └── Estadisticas/  # Visualización de estadísticas
├── config/            # Configuraciones
├── contexts/          # Contextos de React
├── services/          # Servicios y lógica de negocio
└── theme.js           # Configuración de tema MUI
```

## Lógica de Negocio

### 1. Gestión de Grados
- Administración de niveles educativos (ej: Primer Año de Secundaria, Cuarto Grado de Primaria)
- Cada grado representa un nivel específico en la institución educativa

### 2. Gestión de Docentes
- Registro y administración de maestros
- Relación con grados (un docente puede enseñar en múltiples grados)
- Colección en Firestore: `grados-docentes` para manejar la relación

### 3. Sistema de Encuestas
- Creación de encuestas por grado
- Relación con preguntas predefinidas
- Colección en Firestore: `encuesta-preguntas`

### 4. Banco de Preguntas
- Módulo independiente para almacenar preguntas
- Reutilización de preguntas en diferentes encuestas
- Relación con alternativas de respuesta

### 5. Banco de Alternativas
- Módulo independiente para almacenar opciones de respuesta
- Relación con preguntas
- Colección en Firestore: `preguntas-alternativas`

### 6. Gestión de Usuarios
- Dos tipos de usuarios:
  - Admin: Acceso completo al sistema
  - User: Acceso limitado
- Autenticación manejada directamente en Firebase

### 7. Proceso de Encuesta para Estudiantes
- Ruta pública para estudiantes (sin necesidad de login)
- Selección de grado
- Visualización de encuesta:
  - Una pregunta por pantalla
  - Lista de docentes del grado en filas
  - Alternativas de respuesta en columnas
  - Matriz de evaluación por docente

### 8. Sistema de Estadísticas
- Análisis por:
  - Grado
  - Docente
  - Pregunta
  - Alternativa seleccionada
- Métricas generales y específicas
- Visualización de tendencias y resultados

## Flujo de la Encuesta
1. Estudiante selecciona su grado
2. Sistema muestra preguntas una por una
3. Para cada pregunta:
   - Lista de docentes en filas
   - Alternativas de respuesta en columnas
   - Matriz de evaluación
4. Almacenamiento de respuestas
5. Generación de estadísticas

## Estado Actual
El sistema está en desarrollo activo con las siguientes características implementadas:
- Estructura base del proyecto
- Sistema de autenticación
- Rutas principales
- Componentes base para cada módulo
- Integración con Firebase
- Relaciones entre colecciones en Firestore

## Configuración de Firebase
El proyecto utiliza Firebase con las siguientes configuraciones:
- Authentication para gestión de usuarios
- Firestore para almacenamiento de datos
- Analytics para seguimiento de uso

## Próximos Pasos
1. Implementar la interfaz de encuesta para estudiantes
2. Desarrollar el sistema de matriz de evaluación
3. Crear el módulo de estadísticas
4. Implementar la visualización de resultados
5. Agregar validaciones y manejo de errores
6. Implementar pruebas automatizadas

## Notas de Desarrollo
- El proyecto sigue una arquitectura modular
- Se utiliza Context API para el manejo de estado global
- Se implementan buenas prácticas de React y Firebase
- Se mantiene una estructura de código limpia y mantenible
- Las relaciones entre entidades se manejan a través de colecciones en Firestore
