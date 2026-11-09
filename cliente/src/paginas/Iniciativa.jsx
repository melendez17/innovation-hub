import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSesion } from '../hooks/useSesion'
import { useConsulta } from '../hooks/useConsulta'
import { pedir } from '../api/cliente'
import { nombreCompleto, fecha } from '../utils/formatos'
import Pagina from '../components/layout/Pagina'
import Competencias from '../components/comunes/Competencias'
import Confirmacion from '../components/comunes/Confirmacion'
import Equipo from '../components/equipos/Equipo'
import {
  Cargando,
  ErrorConsulta,
  EtiquetaEstado,
  Aviso,
} from '../components/comunes/Estados'
export default function Iniciativa() {
  const { id } = useParams()
  const { usuario } = useSesion()
  const navegar = useNavigate()
  const resultado = useConsulta(`/iniciativas/${id}`)
  const iniciativa = resultado.datos
  const propietario =
    iniciativa?.propietarioId === usuario?._id && Boolean(usuario)
  const solicitudes = useConsulta(
    propietario ? `/iniciativas/${id}/solicitudes?size=1` : null,
    true,
  )
  const [accion, setAccion] = useState('')
  const [aviso, setAviso] = useState('')
  if (resultado.cargando)
    return (
      <Pagina titulo="Iniciativa">
        <Cargando />
      </Pagina>
    )
  if (resultado.error)
    return (
      <Pagina titulo="No se pudo abrir la iniciativa">
        <ErrorConsulta error={resultado.error} recargar={resultado.recargar} />
      </Pagina>
    )
  if (!iniciativa) return null
  const completa = iniciativa.accesoCompleto !== false
  const miembro = iniciativa.miembros?.some((m) => m._id === usuario?._id)
  const abierta = ['Publicada', 'En formación de equipo'].includes(
    iniciativa.estado,
  )
  const puedeSolicitar =
    usuario && !propietario && !miembro && (!completa || abierta)
  const tieneRelaciones =
    iniciativa.miembros?.length > 1 ||
    iniciativa.proyectoId ||
    solicitudes.datos?.total > 0
  const reglaBorrado = tieneRelaciones
    ? 'Se archivará para conservar su información relacionada. Dejará de aparecer en el catálogo.'
    : 'Si no tiene información relacionada, se eliminará definitivamente. Si conserva solicitudes, integrantes o un proyecto, se archivará para mantener ese historial.'
  return (
    <Pagina
      titulo={iniciativa.titulo}
      volver={{ ruta: '/catalogo', texto: 'Volver al catálogo' }}
      acciones={
        <>
          {propietario && iniciativa.estado !== 'Archivada' && (
            <Link
              className="btn btn-outline-primary"
              to={`/iniciativa/${id}/editar`}
            >
              Editar iniciativa
            </Link>
          )}
          {propietario && iniciativa.estado === 'Borrador' && (
            <button
              className="btn btn-primary"
              onClick={() => setAccion('publicar')}
            >
              Publicar iniciativa
            </button>
          )}
          {puedeSolicitar && (
            <Link
              className="btn btn-primary"
              to={`/iniciativa/${id}/solicitar`}
            >
              Solicitar participación
            </Link>
          )}
        </>
      }
    >
      <Aviso>{aviso}</Aviso>
      <div className="d-flex gap-2 flex-wrap mb-4">
        <span>
          {iniciativa.tipo} · {iniciativa.categoria}
        </span>
        <EtiquetaEstado estado={iniciativa.estado} />
        <span className="texto-secundario">{iniciativa.visibilidad}</span>
      </div>
      {!completa && (
        <p className="alert alert-info">
          Esta iniciativa es restringida. Puedes consultar su resumen; los
          detalles se reservan al propietario y a los integrantes aceptados.
        </p>
      )}
      <div className="row g-4">
        <div className={completa ? 'col-lg-8' : 'col-12'}>
          <section className="seccion-detalle">
            <h2>Resumen</h2>
            <p className="texto-largo">{iniciativa.resumen}</p>
          </section>
          {completa && (
            <>
              {[
                ['Descripción', iniciativa.descripcion],
                ['Problema', iniciativa.problema],
                ['Personas beneficiadas', iniciativa.beneficiados],
              ]
                .filter(([, texto]) => texto)
                .map(([titulo, texto]) => (
                  <section key={titulo} className="seccion-detalle">
                    <h2>{titulo}</h2>
                    <p className="texto-largo">{texto}</p>
                  </section>
                ))}
            </>
          )}
          <section className="seccion-detalle">
            <h2>Competencias requeridas</h2>
            <Competencias valores={iniciativa.competencias} />
          </section>
          {completa && iniciativa.etiquetas?.length > 0 && (
            <section className="seccion-detalle">
              <h2>Etiquetas</h2>
              <ul className="lista-etiquetas">
                {iniciativa.etiquetas.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
        {completa && (
          <aside className="col-lg-4">
            <div className="resumen-lateral">
              <dl className="datos-detalle">
                <dt>Propietario</dt>
                <dd>
                  {usuario ? (
                    <Link to={`/usuarios/${iniciativa.propietarioId}`}>
                      {nombreCompleto(iniciativa.propietario)}
                    </Link>
                  ) : (
                    nombreCompleto(iniciativa.propietario)
                  )}
                </dd>
                <dt>Equipo y capacidad</dt>
                <dd>
                  {iniciativa.integrantesActuales} de{' '}
                  {iniciativa.cantidadIntegrantes} integrantes ·{' '}
                  {iniciativa.espaciosDisponibles} espacios disponibles
                </dd>
                <dt>Creación</dt>
                <dd>{fecha(iniciativa.fechaCreacion)}</dd>
                <dt>Publicación</dt>
                <dd>{fecha(iniciativa.fechaPublicacion)}</dd>
                <dt>Última modificación</dt>
                <dd>{fecha(iniciativa.fechaUltimaModificacion)}</dd>
              </dl>
            </div>
            <div className="acciones mt-4">
              {propietario && (
                <Link
                  className="btn btn-outline-primary"
                  to={`/iniciativa/${id}/solicitudes`}
                >
                  Solicitudes recibidas
                </Link>
              )}
              {propietario && abierta && iniciativa.miembros.length > 1 && (
                <Link
                  className="btn btn-primary"
                  to={`/iniciativa/${id}/convertir`}
                >
                  Convertir en proyecto
                </Link>
              )}
              {iniciativa.proyectoId && (
                <Link
                  className="btn btn-primary"
                  to={`/proyectos/${iniciativa.proyectoId}`}
                >
                  Ver proyecto
                </Link>
              )}
              {propietario && iniciativa.estado !== 'Archivada' && (
                <button
                  className="btn btn-outline-danger"
                  onClick={() => setAccion('eliminar')}
                >
                  Eliminar o archivar
                </button>
              )}
            </div>
            {propietario && abierta && iniciativa.miembros.length < 2 && (
              <p className="small texto-secundario mt-3">
                Para convertirla en proyecto debe participar al menos otra
                persona además del propietario.
              </p>
            )}
          </aside>
        )}
      </div>
      {!usuario && (
        <p>
          <Link to="/ingresar" state={{ desde: `/iniciativa/${id}` }}>
            Inicia sesión
          </Link>{' '}
          para solicitar participación.
        </p>
      )}
      {completa && (
        <Equipo iniciativa={iniciativa} alCambiar={resultado.recargar} />
      )}
      <Confirmacion
        abierta={Boolean(accion)}
        titulo={
          accion === 'publicar'
            ? 'Publicar iniciativa'
            : tieneRelaciones
              ? 'Archivar iniciativa'
              : 'Eliminar o archivar iniciativa'
        }
        descripcion={
          accion === 'publicar'
            ? 'La iniciativa dejará de ser un borrador. Mantendrá la visibilidad elegida y podrá recibir solicitudes de participación.'
            : reglaBorrado
        }
        textoConfirmar={
          accion === 'publicar'
            ? 'Publicar'
            : tieneRelaciones
              ? 'Archivar'
              : 'Confirmar'
        }
        peligrosa={accion !== 'publicar'}
        onCerrar={() => setAccion('')}
        onConfirmar={async () => {
          if (accion === 'publicar') {
            await pedir(`/iniciativas/${id}/publicacion`, 'POST')
            setAviso('Iniciativa publicada.')
            resultado.recargar()
          } else {
            const archivada = await pedir(`/iniciativas/${id}`, 'DELETE')
            if (archivada) {
              setAviso('Iniciativa archivada. Se conserva su historial.')
              resultado.recargar()
            } else
              navegar('/catalogo?ambito=propias', {
                state: { mensaje: 'Iniciativa eliminada.' },
              })
          }
        }}
      />
    </Pagina>
  )
}
