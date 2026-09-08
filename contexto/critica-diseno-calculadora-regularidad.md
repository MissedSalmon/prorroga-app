# Crítica de Diseño: Calculadora de Regularidad (prorroga-app)

**URL:** https://prorroga-app.vercel.app/
**Contexto:** Herramienta que permite a estudiantes verificar el estado de regularidad de sus materias según la Ordenanza N° 1622, seleccionando materias, cargando año de cursado y si se otorgó prórroga.

---

## Impresión General
La app comunica su propósito con claridad desde el primer segundo: título grande, subtítulo que explica la función y referencia normativa. La estética es limpia y sobria, coherente con un trámite académico/institucional. La mayor oportunidad de mejora está en el flujo de carga de datos (año de cursado) y en reforzar la selección de materias con algo más que color.

## Usabilidad

| Hallazgo | Severidad | Recomendación |
|---|---|---|
| El campo "Año Cursado" solo muestra el placeholder genérico "Año", sin formato esperado (¿AAAA?), sin indicar si es obligatorio, y no hay evidencia de validación ante un valor vacío o inválido | 🔴 Crítico | Agregar formato sugerido (ej. "2024"), input numérico con máscara, asterisco de obligatoriedad y mensaje de error inline si se intenta calcular sin completarlo |
| Desde el modal de resultado ("Estado Académico") no hay forma de volver a editar el año o la prórroga sin cerrar y reiniciar todo el flujo de selección | 🟡 Moderado | Agregar un botón "Editar" o "Volver" que regrese al modal de configuración conservando lo ya cargado |
| La lista de materias (18 ítems) no está agrupada por año/cuatrimestre, lo que obliga a escanear toda la grilla para encontrar una materia puntual | 🟡 Moderado | Agrupar con subtítulos ("1er año", "2do año", etc.) para dar un punto de referencia y acelerar el escaneo |
| No hay buscador ni filtro para la lista de materias | 🟢 Menor | No urgente con 18 materias, pero conviene preverlo si la lista puede crecer (otras carreras, otros planes) |
| No se ve feedback de carga (loading) entre "Calcular Regularidades" y la aparición del resultado | 🟢 Menor | Confirmar que exista un estado de carga breve para evitar dobles clics |

## Jerarquía Visual
- **Qué atrae la mirada primero:** el ícono institucional (escarapela), por tamaño y contraste — antes que el título "Calculadora de Regularidad". Para una herramienta cuyo valor está en el nombre y la función, el ícono le está "robando" protagonismo al texto.
- **Flujo de lectura:** en general de arriba hacia abajo funciona bien (ícono → título → subtítulo → instrucción → grilla → CTA), pero se corta por el salto de espacio en blanco muy amplio entre el final de la grilla de materias y el botón "Configurar Cursado", que debilita la sensación de que ambos elementos pertenecen al mismo paso.
- **Énfasis en el resultado:** correcto — el pill de estado (VENCIDA/REGULAR) en color y el nombre de la materia en negrita son lo primero que se lee, seguido de la explicación y la fecha límite. Buena jerarquía dentro del modal de resultado.

## Consistencia

| Elemento | Problema | Recomendación |
|---|---|---|
| Color de botones primarios | "Configurar Cursado" (azul medio), "Calcular Regularidades" (azul marino) y "Cerrar" (casi negro) son tres tonos distintos para lo que son, en esencia, tres pasos de "avanzar" en el mismo flujo | Unificar un solo color primario para "avanzar/confirmar" en todo el flujo, y reservar un tono neutro solo para acciones de cierre/cancelar |
| Selección de materia | El único indicador de "seleccionada" es el cambio de color de fondo/borde (blanco/gris → celeste/azul) | Sumar un ícono de check o un cambio de peso tipográfico además del color, para no depender de un solo canal visual |
| Patrón de modal | Encabezado + subtítulo + ícono de cierre se repite igual entre "Años y Prórrogas" y "Estado Académico" | Sin problema — es un acierto de consistencia, vale la pena mantenerlo al agregar nuevas pantallas |

## Accesibilidad
- **Contraste de color:** el subtítulo gris ("Conocé el estado de tus regularidades...") sobre el fondo gris muy claro debería verificarse contra un mínimo de 4.5:1; a simple vista el contraste parece ajustado. Vale la pena confirmarlo con una herramienta como el contrast checker de WebAIM.
- **Dependencia del color:** la selección de materias y, en menor medida, los pills de estado (rojo/verde) comunican información solo por color — un problema para personas con daltonismo. Agregar un ícono o texto redundante (ya lo hacen bien los pills al incluir la palabra "VENCIDA"/"REGULAR", pero las tarjetas de selección no tienen ese refuerzo).
- **Tamaño de objetivos táctiles:** las tarjetas de materias se ven con buen tamaño para tocar en mobile; el ícono de cierre ("X") de los modales es chico y conviene confirmar que su área táctil real sea de al menos 44x44px, no solo el ícono visible.
- **Etiquetas de formulario:** el input de año depende del encabezado de columna "Año Cursado" como única etiqueta — para lectores de pantalla conviene asegurar un `label`/`aria-label` asociado directamente al input, no solo el header de la tabla.

## Qué Funciona Bien
- Codificación semántica de color (rojo = vencida, verde = regular) inmediata y universalmente entendible.
- Cita puntual del artículo del reglamento (Art. 5.1.3) en el resultado: le da respaldo normativo y credibilidad a un cálculo que, de otro modo, sería una "caja negra".
- Micro-copy dinámico en el botón "Configurar Cursado (1)", que refleja cuántas materias se seleccionaron — buen feedback de estado sin necesidad de texto adicional.
- Patrón de modal reutilizado y coherente entre los distintos pasos del flujo.
- Diseño general limpio, con buen uso de espacio en blanco y sin elementos de más que compitan por atención.

## Recomendaciones Prioritarias
1. **Validar y guiar la carga del "Año Cursado"** — es el punto de mayor riesgo funcional: un dato mal cargado invalida todo el cálculo posterior. Agregar formato esperado, obligatoriedad visible y manejo de error.
2. **Reforzar la selección de materias más allá del color** — sumar un check o ícono visible en las tarjetas seleccionadas mejora tanto la accesibilidad como la claridad para cualquier usuario.
3. **Unificar el color de los botones primarios** en todo el flujo, para que "avanzar" se sienta como una sola acción consistente y no como tres pasos con jerarquías visuales distintas.
4. **Permitir editar desde el resultado** sin reiniciar la selección completa de materias — ahorra fricción cuando el usuario se equivoca en el año o quiere probar otro escenario.
5. **Agrupar las materias por año/cuatrimestre** a medida que la lista crece, para que el escaneo visual sea más rápido que revisar 18 tarjetas sueltas.
