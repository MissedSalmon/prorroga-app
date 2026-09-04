import { useState } from 'react'
import utnLogo from './assets/utn.png'
import './App.css'
import datos from './data/calendario.json';
import { useEffect } from 'react';

var anioCursado;
const MATERIAS_TUP = datos.materia;

function calcularEstadoMateria(materiaId, anioCursado) {
  const materia = datos.materia.find(m => m.id === materiaId);
  if (!materia) return { estado: "Error", mensaje: "Materia no encontrada", color: "#6b7280" };

  const sufijoAnio = String(anioCursado).slice(-2);
  const idCicloBuscado = `${materia.cuatrimestre}-ciclo-${sufijoAnio}`;

  // 1. Buscamos el ciclo en el JSON
  const periodoAcademico = datos.periodo.find(p => p.id === idCicloBuscado);

  // 2. Comprobamos ANTES de intentar leer propiedades internas
  if (!periodoAcademico || !periodoAcademico.fechaVencimiento) {
    // Si no está en el JSON porque es muy vieja (ej: 2020-2024), caducó
    return {
      estado: "VENCIDA",
      mensaje: `El ciclo lectivo ${anioCursado} ya superó todos los plazos de regularidad y prórroga reglamentarios. Debés re-cursar.`,
      color: "#991b1b"
    };
  }

  // 3. Ahora sí es seguro hacer el split
  const [dia, mes, anio] = periodoAcademico.fechaVencimiento.split('-').map(Number);
  const fechaFinCiclo = new Date(anio, mes - 1, dia);

  // 4. Plazos de la Ordenanza 1622 (Art. 5.1.3): 1 año base + 1 de prórroga
  const fechaVencimientoBase = new Date(fechaFinCiclo);
  fechaVencimientoBase.setFullYear(fechaVencimientoBase.getFullYear() + 1);

  const fechaVencimientoProrroga = new Date(fechaVencimientoBase);
  fechaVencimientoProrroga.setFullYear(fechaVencimientoProrroga.getFullYear() + 1);

  const fechaHoy = new Date();

  // 5. Comparaciones
  if (fechaHoy <= fechaVencimientoBase) {
    return {
      estado: "REGULAR",
      mensaje: `Vigente. Tu regularidad vence el ${fechaVencimientoBase.toLocaleDateString('es-AR')}. Podés rendir directo.`,
      color: "#166534"
    };
  } else if (fechaHoy > fechaVencimientoBase && fechaHoy <= fechaVencimientoProrroga) {
    return {
      estado: "REQUIERE PRÓRROGA",
      mensaje: `La regularidad base venció el ${fechaVencimientoBase.toLocaleDateString('es-AR')}. Podés solicitar prórroga de 1 año ante Decanato (límite: ${fechaVencimientoProrroga.toLocaleDateString('es-AR')}).`,
      color: "#b45309"
    };
  } else {
    return {
      estado: "VENCIDA",
      mensaje: `Caducó definitivamente el ${fechaVencimientoProrroga.toLocaleDateString('es-AR')}. Debés re-cursar la materia.`,
      color: "#991b1b"
    };
  }
}

function App() {
  const [materiasSeleccionadas, setMateriasSeleccionadas] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false); // Controla el menú emergente
  const [cuatrimestres, setCuatrimestres] = useState({});
  const [aniosCursado, setAniosCursado] = useState({});   // NUEVO: { prog1: 2025, pye: 2026 }
  const [resultados, setResultados] = useState({});
  
  const toggleMateria = (id) => {
    setMateriasSeleccionadas((prev) =>
      prev.includes(id) 
        ? prev.filter((materiaId) => materiaId !== id) // Si ya estaba, la saca
        : [...prev, id]                                // Si no estaba, la agrega
    );
  };

  const materiasParaDesplegar = MATERIAS_TUP.filter(m => materiasSeleccionadas.includes(m.id));

  const procesarCalculosFinales = () => {  // <------------------------------------------------------------ revisar esta funcion

  const nuevosResultados = {};

  // Recorremos solo los IDs de las materias que el alumno seleccionó
  materiasSeleccionadas.forEach((id) => {
    const anio = aniosCursado[id];
    
    // Validamos que el alumno haya ingresado el año antes de calcular
    if (!anio) {
      nuevosResultados[id] = { 
        estado: "Faltan datos", 
        mensaje: "Por favor, ingresá el año de cursado.", 
        color: "#6b7280" 
      };
      return;
    }

    // Ejecutamos tu función de cálculo pasándole los parámetros del formulario
    const resultadoMateria = calcularEstadoMateria(id, anio);
    console.log(resultadoMateria);
    // Guardamos el veredicto indexado por el ID de la materia
    nuevosResultados[id] = resultadoMateria;
  });

  // Guardamos todos los impactos en el estado para mostrarlos en pantalla
  setResultados(nuevosResultados);
  
  // Cerramos el menú emergente
  setModalAbierto(false);
  };

  return (
    <>
      <section id="center">
        <div className="indexlogo">
          <img src={utnLogo} className="base" width="170" height="179" alt="UTN Logo" />
        </div>
        <div>
          <h1>Calculadora de Prorrogas</h1>
          <p style={{ textAlign: 'center' },{marginBottom: 20}}>
            Esta es una sencilla app para que sepas cuando vence tu regularidad
          </p>
        </div>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <p style={{ fontSize: '18px', margin: 0 }}>
          Elegí tus materias
        </p>

        {/* CONTENEDOR DE MULTIPLES BOTONES */}
        <div className="contenedor-interactivo" style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
          
          {MATERIAS_TUP.map((materia) => {
            // 4. Chequeamos si este botón específico está activo
            const estaActiva = materiasSeleccionadas.includes(materia.id);

            return (
              <button
                key={materia.id}
                onClick={() => toggleMateria(materia.id)}
                className="boton-invisible"
              >
                {/* Pasamos la clase 'activa' de forma individual */}
                <div className={`casilla ${estaActiva ? 'activa' : ''}`}>
                  {materia.nombre}
                </div>
              </button>
            );
          })}

        </div>

          {/* BOTÓN PARA ABRIR EL MODAL (Solo se muestra si seleccionó al menos una materia) */}
        {materiasSeleccionadas.length > 0 && (
          <button 
            onClick={() => setModalAbierto(true)}
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Configurar Cuatrimestres ({materiasSeleccionadas.length})
          </button>
        )}

      </section>

      {/* ------------------ MENÚ EMERGENTE (MODAL) ------------------ */}
      {modalAbierto && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo oscuro traslúcido
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '30px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '600px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            color: '#333333',
            position: 'relative'
          }}>

             
          <button style={{
                    padding: '5px 10px',
                    backgroundColor: '#1e293b',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'flex-end'
          }}
              onClick={() => setModalAbierto(false)} className="close">✕
          </button>
                
  

            <form>
            <h2 style={{ marginBottom: '20px', textAlign: 'center', color: '#1e293b' }}>Seleccione Año</h2>
            
            {/* TABLA CON EL FORMATO PEDIDO */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>

              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>Materia</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Año de Cursado</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Prorroga?</th>
                </tr>
              </thead>

              <tbody>
                {materiasParaDesplegar.map((materia) => (
                  <tr key={materia.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 10px', fontWeight: '500' }}>{materia.nombre}</td>
                    

                    {/* Opción 2do Cuatrimestre */}
                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                      <input required
                        type="number"
                        onInvalid={(e) => e.target.setCustomValidity('Ingrese un año valido')}
                        // 2. Al volver a escribir, limpiás el error para que el navegador te deje avanzar
                        onInput={(e) => e.target.setCustomValidity('')} 
                        name={`aniocursado-${materia.id}`}
                        value={aniosCursado[materia.id] || ''}
                        placeholder="Año"
                        onChange={(e) => setAniosCursado(prev => ({
                            ...prev,
                            [materia.id]: parseInt(e.target.value) // Lo convertimos a número entero
                            })
                        )}
                        min={2020}
                        max={2027}
                        style={{ width: '50px' }}
                      />
                    </td>

                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                      <input 
                        type="checkbox" 
                        style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                      />
                    </td>

                    
                  </tr>
                ))}
              </tbody>
            </table>

                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              type="button"
              onClick={() => {
                procesarCalculosFinales();     // 2. Ejecuta la lógica de la ordenanza
                setModalAbierto(false);        // 3. Cierra el modal
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#1e293b',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Listo
            </button>
          </div>

            

            </form>
          </div>
        </div>
      )}

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App