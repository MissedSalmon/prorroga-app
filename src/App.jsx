import { useState } from 'react'
import utnLogo from './assets/utn.png'
import './App.css'
import datos from './data/calendario.json';

const MATERIAS_TUP = datos.materia;

function calcularEstadoMateria(materiaId, anioCursado, yaTieneProrroga) {
  const materia = datos.materia.find(m => m.id === materiaId);
  if (!materia) return { estado: "Error", mensaje: "Materia no encontrada", color: "#6b7280" };

  const sufijoAnio = String(anioCursado).slice(-2);
  const idCicloBuscado = `${materia.cuatrimestre}-ciclo-${sufijoAnio}`;

  const periodoAcademico = datos.periodo.find(p => p.id === idCicloBuscado);

  if (!periodoAcademico || !periodoAcademico.fechaVencimiento) {
    return {
      nombreMateria: materia.nombre,
      estado: "VENCIDA",
      detalle: "Plazo máximo caducado",
      mensaje: `El ciclo lectivo ${anioCursado} ya superó el año reglamentario y la posibilidad de prórroga. Según el Art. 5.1.3 debés re-cursar.`,
      color: "#991b1b"
    };
  }

  const [dia, mes, anio] = periodoAcademico.fechaVencimiento.split('-').map(Number);
  const fechaFinCiclo = new Date(anio, mes - 1, dia);

  // Ordenanza 1622 Art. 5.1.3
  const fechaVencimientoBase = new Date(fechaFinCiclo);
  fechaVencimientoBase.setFullYear(fechaVencimientoBase.getFullYear() + 1);

  const fechaVencimientoProrroga = new Date(fechaVencimientoBase);
  fechaVencimientoProrroga.setFullYear(fechaVencimientoProrroga.getFullYear() + 1);

  const fechaHoy = new Date();

  // 1. Regular dentro del año base
  if (fechaHoy <= fechaVencimientoBase) {
    return {
      nombreMateria: materia.nombre,
      estado: "REGULAR",
      detalle: "Período Ordinario Activo",
      mensaje: `Tu cursado está vigente. Podés rendir en mesas ordinarias hasta el ${fechaVencimientoBase.toLocaleDateString('es-AR')}.`,
      limite: fechaVencimientoBase.toLocaleDateString('es-AR'),
      color: "#166534"
    };
  } 
  
  // 2. Pasó el año base pero no los 2 años máximos
  if (fechaHoy > fechaVencimientoBase && fechaHoy <= fechaVencimientoProrroga) {
    if (yaTieneProrroga) {
      return {
        nombreMateria: materia.nombre,
        estado: "REGULAR CON PRÓRROGA",
        detalle: "Prórroga Anual Aplicada",
        mensaje: `Estás cursando bajo el año de prórroga concedido por Decanato. Vence definitivamente el ${fechaVencimientoProrroga.toLocaleDateString('es-AR')}.`,
        limite: fechaVencimientoProrroga.toLocaleDateString('es-AR'),
        color: "#2563eb"
      };
    } else {
      return {
        nombreMateria: materia.nombre,
        estado: "REQUIERE PRÓRROGA",
        detalle: "Regularidad base vencida",
        mensaje: `Tu período ordinario venció el ${fechaVencimientoBase.toLocaleDateString('es-AR')}. Tenés tiempo de solicitar la prórroga por única vez hasta el ${fechaVencimientoProrroga.toLocaleDateString('es-AR')}.`,
        limite: fechaVencimientoProrroga.toLocaleDateString('es-AR'),
        color: "#b45309"
      };
    }
  }

  // 3. Caducada totalmente
  return {
    nombreMateria: materia.nombre,
    estado: "VENCIDA",
    detalle: "Caducidad definitiva",
    mensaje: `Superó el plazo máximo improrrogable (${fechaVencimientoProrroga.toLocaleDateString('es-AR')}). Debés re-cursar la asignatura.`,
    limite: fechaVencimientoProrroga.toLocaleDateString('es-AR'),
    color: "#991b1b"
  };
}

function App() {
  const [materiasSeleccionadas, setMateriasSeleccionadas] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalResultadosAbierto, setModalResultadosAbierto] = useState(false);
  
  const [aniosCursado, setAniosCursado] = useState({});
  const [prorrogasPedidas, setProrrogasPedidas] = useState({});
  const [resultados, setResultados] = useState([]);

  const toggleMateria = (id) => {
    setMateriasSeleccionadas((prev) =>
      prev.includes(id) 
        ? prev.filter((materiaId) => materiaId !== id)
        : [...prev, id]
    );
  };

  const materiasParaDesplegar = MATERIAS_TUP.filter(m => materiasSeleccionadas.includes(m.id));

  const procesarCalculosFinales = () => {
    const listaResultados = [];

    materiasSeleccionadas.forEach((id) => {
      const anio = aniosCursado[id];
      const tieneProrroga = !!prorrogasPedidas[id];
      
      if (!anio) {
        listaResultados.push({
          nombreMateria: MATERIAS_TUP.find(m => m.id === id)?.nombre || id,
          estado: "FALTAN DATOS",
          detalle: "Año no ingresado",
          mensaje: "No se ingresó el año de cursado en el formulario.",
          color: "#6b7280"
        });
        return;
      }

      const res = calcularEstadoMateria(id, anio, tieneProrroga);
      listaResultados.push(res);
    });

    setResultados(listaResultados);
    setModalAbierto(false);
    setModalResultadosAbierto(true); // Abre el modal con el detalle
  };

  return (
    <>
      <section id="center">
        <div className="indexlogo">
          <img src={utnLogo} className="base" width="170" height="179" alt="UTN Logo" />
        </div>
        <div>
          <h1>Calculadora de Prórrogas</h1>
          <p style={{ textAlign: 'center', marginBottom: 20 }}>
            Conocé el estado de tus regularidades según la Ordenanza Nº 1622
          </p>
        </div>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <p style={{ fontSize: '18px', margin: 0 }}>Elegí tus materias</p>

        <div className="contenedor-interactivo" style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
          {MATERIAS_TUP.map((materia) => {
            const estaActiva = materiasSeleccionadas.includes(materia.id);
            return (
              <button
                key={materia.id}
                onClick={() => toggleMateria(materia.id)}
                className="boton-invisible"
              >
                <div className={`casilla ${estaActiva ? 'activa' : ''}`}>
                  {materia.nombre}
                </div>
              </button>
            );
          })}
        </div>

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
            Configurar Cursado ({materiasSeleccionadas.length})
          </button>
        )}
      </section>

      {/* ------------------ MODAL 1: FORMULARIO ------------------ */}
      {modalAbierto && (
        <div style={estilosModal.backdrop}>
          <div style={estilosModal.ventana}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: '#1e293b' }}>Años y Prórrogas</h2>
              <button onClick={() => setModalAbierto(false)} style={estilosModal.btnCerrar}>✕</button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); procesarCalculosFinales(); }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', margin: '20px 0' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>Materia</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Año Cursado</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>¿Prórroga Otorgada?</th>
                  </tr>
                </thead>
                <tbody>
                  {materiasParaDesplegar.map((materia) => (
                    <tr key={materia.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 10px', fontWeight: '500' }}>{materia.nombre}</td>
                      <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                        <input 
                          required
                          type="number"
                          min={2020}
                          max={2027}
                          placeholder="Año"
                          value={aniosCursado[materia.id] || ''}
                          onChange={(e) => setAniosCursado(prev => ({
                            ...prev,
                            [materia.id]: parseInt(e.target.value)
                          }))}
                          style={{ width: '65px', padding: '5px', textAlign: 'center' }}
                        />
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                        <input 
                          type="checkbox"
                          checked={!!prorrogasPedidas[materia.id]}
                          onChange={(e) => setProrrogasPedidas(prev => ({
                            ...prev,
                            [materia.id]: e.target.checked
                          }))}
                          style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" style={estilosModal.btnAccion}>
                  Calcular Regularidades
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------ MODAL 2: RESULTADOS DETALLADOS ------------------ */}
      {modalResultadosAbierto && (
        <div style={estilosModal.backdrop}>
          <div style={{ ...estilosModal.ventana, maxWidth: '700px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div>
                <h2 style={{ margin: 0, color: '#1e293b' }}>Estado Académico</h2>
                <small style={{ color: '#64748b' }}>Reglamento de Estudio Ord. Nº 1622</small>
              </div>
              <button onClick={() => setModalResultadosAbierto(false)} style={estilosModal.btnCerrar}>✕</button>
            </div>

            <div style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '5px' }}>
              {resultados.map((item, idx) => (
                <div 
                  key={idx} 
                  style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    padding: '14px',
                    marginBottom: '12px',
                    borderLeft: `6px solid ${item.color}`,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '16px', color: '#0f172a' }}>{item.nombreMateria}</strong>
                    <span style={{ 
                      backgroundColor: item.color, 
                      color: '#ffffff', 
                      fontSize: '11px', 
                      padding: '3px 8px', 
                      borderRadius: '12px',
                      fontWeight: 'bold' 
                    }}>
                      {item.estado}
                    </span>
                  </div>

                  <p style={{ margin: '8px 0 4px 0', fontSize: '13px', color: '#334155' }}>
                    {item.mensaje}
                  </p>

                  {item.limite && (
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      <strong>Fecha Límite:</strong> {item.limite}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
              <button 
                onClick={() => setModalResultadosAbierto(false)}
                style={estilosModal.btnAccion}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

// Objeto de estilos limpios para los modales
const estilosModal = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  ventana: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '600px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
    color: '#333333',
    position: 'relative'
  },
  btnCerrar: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#64748b',
    padding: '4px 8px'
  },
  btnAccion: {
    padding: '10px 20px',
    backgroundColor: '#1e293b',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600'
  }
};

export default App;