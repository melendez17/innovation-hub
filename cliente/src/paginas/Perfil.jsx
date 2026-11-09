import { Link, useParams } from 'react-router-dom'
import { useConsulta } from '../hooks/useConsulta'
import { nombreCompleto } from '../utils/formatos'
import Pagina from '../components/layout/Pagina'
import Competencias from '../components/comunes/Competencias'
import { Cargando, ErrorConsulta } from '../components/comunes/Estados'
export default function Perfil() {
  const { id } = useParams()
  const resultado = useConsulta(id ? `/usuarios/${id}` : '/usuarios/me')
  const usuario = resultado.datos
  return (
    <Pagina
      titulo={id ? 'Perfil de la comunidad' : 'Mi perfil'}
      acciones={
        !id && (
          <Link className="btn btn-primary" to="/perfil/editar">
            Editar perfil
          </Link>
        )
      }
    >
      {resultado.cargando ? (
        <Cargando />
      ) : resultado.error ? (
        <ErrorConsulta error={resultado.error} recargar={resultado.recargar} />
      ) : (
        usuario && (
          <div className="row g-4">
            <div className="col-lg-8">
              <section className="seccion-detalle">
                <h2>{nombreCompleto(usuario)}</h2>
                <p>
                  {usuario.tipo} · {usuario.carrera}
                </p>
                <p className="texto-largo">
                  {usuario.descripcionPersonal ||
                    'Esta persona todavía no ha agregado una descripción.'}
                </p>
              </section>
              <section className="seccion-detalle">
                <h2>Competencias</h2>
                <Competencias valores={usuario.competencias} />
              </section>
              <section className="seccion-detalle">
                <h2>Intereses</h2>
                {usuario.intereses?.length ? (
                  <ul>
                    {usuario.intereses.map((interes) => (
                      <li key={interes}>{interes}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="texto-secundario">Sin intereses registrados.</p>
                )}
              </section>
            </div>
            <aside className="col-lg-4">
              <div className="resumen-lateral">
                <dl className="datos-detalle">
                  {!id && (
                    <>
                      <dt>Correo electrónico</dt>
                      <dd>{usuario.email}</dd>
                    </>
                  )}
                  <dt>Disponibilidad</dt>
                  <dd>{usuario.disponibilidad || 'Sin especificar'}</dd>
                  <dt>Portafolio</dt>
                  <dd>
                    {usuario.portafolio ? (
                      <a
                        href={usuario.portafolio}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Abrir portafolio (nueva pestaña)
                      </a>
                    ) : (
                      'Sin registrar'
                    )}
                  </dd>
                </dl>
              </div>
              {!id && (
                <div className="acciones mt-4">
                  <Link to="/catalogo?ambito=propias">Mis iniciativas</Link>
                  <Link to="/proyectos?ambito=equipo">
                    Mis proyectos y equipos
                  </Link>
                </div>
              )}
            </aside>
          </div>
        )
      )}
    </Pagina>
  )
}
