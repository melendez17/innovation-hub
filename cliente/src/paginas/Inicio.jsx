import { Link } from 'react-router-dom'
import { useSesion } from '../hooks/useSesion'
import { useConsulta } from '../hooks/useConsulta'
import ListaIniciativas from '../components/iniciativas/ListaIniciativas'
import { Cargando, ErrorConsulta, Vacio } from '../components/comunes/Estados'
export default function Inicio() {
  const { usuario } = useSesion()
  const recientes = useConsulta('/iniciativas?size=3&sort=-fechaCreacion', true)
  return (
    <>
      <section className="portada">
        <h1 tabIndex={-1}>Conecta, innova y transforma</h1>
        <p>
          Un espacio para compartir ideas, encontrar personas con habilidades
          complementarias y construir proyectos en comunidad.
        </p>
        <div className="acciones mt-4">
          <Link className="btn btn-light" to="/catalogo">
            Explorar iniciativas
          </Link>
          <Link
            className="btn btn-outline-light"
            to={usuario ? '/iniciativas/nueva' : '/registro'}
          >
            {usuario ? 'Crear iniciativa' : 'Unirme a la comunidad'}
          </Link>
        </div>
      </section>
      <section className="row g-4 mb-5">
        <div className="col-md-5">
          <h2>De una idea a un equipo</h2>
          <p className="texto-secundario">
            Encuentra una iniciativa que te interese o da el primer paso con la
            tuya.
          </p>
        </div>
        <div className="col-md-7">
          <ol className="pasos">
            <li>
              <strong>Completa tu perfil</strong>Cuenta qué sabes hacer y cuándo
              puedes colaborar.
            </li>
            <li>
              <strong>Publica o participa</strong>Comparte tu iniciativa o envía
              una solicitud a su propietario.
            </li>
            <li>
              <strong>Construyan un proyecto</strong>Reúnan al equipo y
              conviertan la iniciativa en un proyecto.
            </li>
          </ol>
        </div>
      </section>
      <section>
        <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
          <h2 className="mb-0">Iniciativas recientes</h2>
          <Link to="/catalogo">Ver catálogo</Link>
        </div>
        {recientes.cargando ? (
          <Cargando />
        ) : recientes.error ? (
          <ErrorConsulta
            error={recientes.error}
            recargar={recientes.recargar}
          />
        ) : recientes.datos?.items.length ? (
          <ListaIniciativas iniciativas={recientes.datos.items} />
        ) : (
          <Vacio titulo="Todavía no hay iniciativas disponibles">
            <p>Las iniciativas publicadas aparecerán aquí.</p>
          </Vacio>
        )}
      </section>
    </>
  )
}
