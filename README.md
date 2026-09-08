# Calculadora de Regularidad TUP

Herramienta web construida con React y Vite diseñada para que los estudiantes de la Tecnicatura Universitaria en Programación (TUP) puedan consultar rápidamente el estado de regularidad de sus materias en base a la Ordenanza Nº 1622.

## Características

- **Selección de materias:** Grilla responsiva para elegir múltiples materias a la vez.
- **Validación automática de fechas:** Calcula si una materia está Regular, Requiere Prórroga o está Vencida dependiendo del año en que se regularizó y la fecha límite impuesta por la ordenanza.
- **Cálculo de prórroga:** Permite marcar materias que ya cuentan con prórroga otorgada por el decanato para ajustar los cálculos.
- **Interfaz moderna y responsiva:** Diseño estilo "tarjeta" flotante, modales con animaciones fluidas, y completa adaptabilidad a dispositivos móviles.
- **Autocompletado inteligente:** El campo de selección de año despliega automáticamente un menú con los últimos años para agilizar la carga.

## Tecnologías Utilizadas

- **React 19**
- **Vite** (Build tool rápida)
- **Vanilla CSS** (con animaciones modernas CSS puro y variables customizadas)
- **Node.js** (Entorno de desarrollo)

## Cómo ejecutar el proyecto

1. Clona este repositorio o descárgalo a tu máquina.
2. Instala las dependencias necesarias con:
   ```bash
   npm install
   ```
3. Levanta el servidor de desarrollo local:
   ```bash
   npm run dev
   ```
4. El proyecto estará disponible en `http://localhost:5173`.

## Estructura

- `src/App.jsx`: Contiene toda la lógica principal de estados, cálculo de regularidades y la estructura de componentes y modales.
- `src/App.css`: Estilos de las tarjetas interactivas, la estructura de grid de materias y modales responsivos.
- `src/index.css`: Declaración del tema global, colores base de la UTN y animaciones por defecto.
- `src/data/calendario.json`: Archivo base que contiene el registro de materias y la lógica de cuatrimestres/ciclos vitales para calcular vencimientos.
