import { Link, useParams } from 'react-router-dom'
import { useConsulta } from '../hooks/useConsulta'
import { fecha, nombreCompleto } from '../utils/formatos'
import Pagina from '../components/layout/Pagina'
import {
  Cargando,
  ErrorConsulta,
  EtiquetaEstado,
} from '../components/comunes/Estados'
import { TablaEquipo } from '../components/equipos/Equipo'
import GitHub from '../components/proyectos/GitHub'
export default function Proyecto() {
  const { id } = useParams()
  const resultado = useConsulta(`/proyectos/${id}`)
  const proyecto = resultado.datos
  return (
    <Pagina
      titulo={proyecto?.nombre || 'Proyecto'}
      volver={{ ruta: '/proyectos', texto: 'Volver a proyectos' }}
    >
      {resultado.cargando ? (
        <Cargando />
      ) : resultado.error ? (
        <ErrorConsulta error={resultado.error} recargar={resultado.recargar} />
      ) : (
        proyecto && (
          <>
            <div className="mb-4">
              <EtiquetaEstado estado={proyecto.estado} />
            </div>
            <div className="row g-4">
              <div className="col-lg-8">
                <section className="seccion-detalle">
                  <h2>Descripción</h2>
                  <p className="texto-largo">{proyecto.descripcion}</p>
                </section>
                <section className="seccion-detalle">
                  <h2>Objetivo</h2>
                  <p className="texto-largo">{proyecto.objetivo}</p>
                </section>
                <section className="seccion-detalle">
                  <h2>Tecnologías</h2>
                  {proyecto.tecnologias.length ? (
                    <ul className="lista-etiquetas">
                      {proyecto.tecnologias.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>Sin tecnologías registradas.</p>
                  )}
                </section>
                <GitHub repositorioUrl={proyecto.repositorioUrl} />
              </div>
              <aside className="col-lg-4">
                <dl className="resumen-lateral datos-detalle">
                  <dt>Iniciativa de origen</dt>
                  <dd>
                    <Link to={`/iniciativa/${proyecto.iniciativaId}`}>
                      {proyecto.iniciativa.titulo}
                    </Link>
                  </dd>
                  <dt>Propietario</dt>
                  <dd>{nombreCompleto(proyecto.propietario)}</dd>
                  <dt>Visibilidad</dt>
                  <dd>{proyecto.iniciativa.visibilidad}</dd>
                  <dt>Fecha de inicio</dt>
                  <dd>{fecha(proyecto.fechaInicio)}</dd>
                  <dt>Finalización estimada</dt>
                  <dd>{fecha(proyecto.fechaFinEstimada)}</dd>
                  <dt>Creación</dt>
                  <dd>{fecha(proyecto.fechaCreacion)}</dd>
                </dl>
              </aside>
            </div>
            <section className="seccion-detalle">
              <h2>Equipo del proyecto</h2>
              <TablaEquipo miembros={proyecto.miembros} />
            </section>
          </>
        )
      )}
    </Pagina>
  )
}
