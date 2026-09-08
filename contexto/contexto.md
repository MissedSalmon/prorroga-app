# Contexto y Progreso del Proyecto

Este directorio contiene documentos relacionados al análisis de diseño, mejoras de usabilidad y feedback de la aplicación.

## Cambios Recientes Implementados (UX / UI)

En base a la crítica de diseño y requerimientos iterativos, se implementaron las siguientes mejoras en la interfaz de usuario:

1. **Ajuste de Paleta de Colores Institucional:**
   - Implementación de colores base (UTN Blue, Light, Accent) definidos por variables CSS.
   - Suavizado del fondo principal a un gris claro para mejorar la legibilidad y reducir el cansancio visual.
   
2. **Jerarquía Visual y Segmentación:**
   - La aplicación dejó de "flotar en el aire" y ahora todo su contenido principal está segmentado en una tarjeta limpia (`.main-container`) con efecto de elevación y desenfoque (reflejos sutiles).
   - Se redujo el tamaño del logotipo principal de la TUP, integrándolo como un apoyo visual del título principal en lugar de robar la atención.
   - El Favicon de la pestaña fue actualizado para utilizar el isotipo oficial.

3. **Optimización del Layout (Responsividad y Espacio):**
   - La grilla de selección de materias se reescribió utilizando `CSS Grid` para alinear horizontal y verticalmente cada botón con tamaño idéntico sin importar el largo del texto de la materia.
   - Las materias dentro de los modales pasaron de usar tablas a un diseño *flex* apilable, asegurando que se adapte perfectamente a las pantallas de teléfonos móviles.

4. **Experiencia de Modales:**
   - Animaciones fluidas: Los modales ya no aparecen de golpe (efecto de choque). Ahora cuentan con un fondo difuminado suave (*fade-in*) y una animación de entrada ascendente (*slide-up / scale*).
   - Cierre rápido con un simple clic fuera de la ventana.

5. **Mejoras en Formularios (Ingreso de Año):**
   - Se eliminaron las molestas flechas incrementales del input numérico, proporcionando una interfaz mucho más limpia.
   - Se conectó un autocompletado nativo (`<datalist>`) inteligente y dinámico. El formulario le pregunta al sistema el año en curso y genera automáticamente una lista desplegable sugerida de los últimos 5 años, restringiendo a su vez la capacidad de ingresar fechas futuras.
