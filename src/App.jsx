import { useState } from 'react'
import utnLogo from './assets/LOGO TUP.png'
import './App.css'
import datos from './data/calendario.json';

const MATERIAS_TUP = datos.materia;

function calcularEstadoMateria(materiaId, anioCursado, yaTieneProrroga) {
  console.log(anioCursado)
  const materia = datos.materia.find(m => m.id === materiaId);
  if (!materia) return { estado: "Error", mensaje: "Materia no encontrada", color: "#6b7280" };

  const sufijoAnio = String(anioCursado-1).slice(-2);
  console.log(anioCursado)
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

      const res = calcularEstadoMateria(id, anio+1, tieneProrroga);
      listaResultados.push(res);
    });

    setResultados(listaResultados);
    setModalAbierto(false);
    setModalResultadosAbierto(true);
  };

  return (
    <div className="main-container">
      <section id="center">
        <div style={{ 
          display: 'flex', 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '20px', 
          flexWrap: 'wrap',
          padding: '0 15px'
        }}>
          <img 
            src={utnLogo} 
            style={{ maxHeight: '55px', width: 'auto', objectFit: 'contain' }} 
            alt="UTN Logo" 
          />
          <h1 style={{ margin: 0, textAlign: 'left' }}>
            Calculadora de Regularidad
          </h1>
        </div>
        <p style={{ textAlign: 'center', margin: '5px 0 20px', color: '#555' }}>
          Conocé el estado de regularidad de tus materias según lo indica la Ordenanza Nº 1622
        </p>
      </section>

      <section id="next-steps">
        <p style={{ fontSize: '18px', margin: 0 }}>Seleccioná tus materias</p>

        <div className="contenedor-interactivo">
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
              backgroundColor: 'var(--utn-blue)', 
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 4px 6px rgba(0, 56, 118, 0.2)',
              transition: 'transform 0.1s'
            }}
          >
            Configurar Cursado ({materiasSeleccionadas.length})
          </button>
        )}
      </section>

      {modalAbierto && (
        <div className="modal-backdrop" onClick={() => setModalAbierto(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h2 style={{ margin: 0, color: 'var(--utn-blue)' }}>Años y Prórrogas</h2>
              <button onClick={() => setModalAbierto(false)} style={estilosModal.btnCerrar}>✕</button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); procesarCalculosFinales(); }}>
              <datalist id="anios-sugeridos">
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(anio => (
                  <option key={anio} value={anio} />
                ))}
              </datalist>

              <div className="modal-list">
                {materiasParaDesplegar.map((materia) => (
                  <div key={materia.id} className="modal-item">
                    <div className="modal-item-name">{materia.nombre}</div>
                    <div className="modal-item-controls">
                      <input 
                        required
                        type="number"
                        min={2010}
                        max={new Date().getFullYear()}
                        placeholder="Año"
                        list="anios-sugeridos"
                        className="input-anio"
                        value={aniosCursado[materia.id] || ''}
                        onChange={(e) => setAniosCursado(prev => ({
                          ...prev,
                          [materia.id]: parseInt(e.target.value)
                        }))}
                      />
                      <label className="checkbox-prorroga">
                        <input 
                          type="checkbox"
                          checked={!!prorrogasPedidas[materia.id]}
                          onChange={(e) => setProrrogasPedidas(prev => ({
                            ...prev,
                            [materia.id]: e.target.checked
                          }))}
                        />
                        ¿Prórroga?
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="submit" style={estilosModal.btnAccion}>
                  Calcular Regularidades
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalResultadosAbierto && (
        <div className="modal-backdrop" onClick={() => setModalResultadosAbierto(false)}>
          <div className="modal-window" style={{ maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div>
                <h2 style={{ margin: 0, color: 'var(--utn-blue)' }}>Estado Académico</h2>
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
    </div>
  )
}

const estilosModal = {
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
    backgroundColor: 'var(--utn-blue)', 
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600'
  }
};

export default App;
