import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSesion } from '../hooks/useSesion'
import { useConsulta } from '../hooks/useConsulta'
import { pedir } from '../api/cliente'
import { fecha, nombreCompleto } from '../utils/formatos'
import Pagina from '../components/layout/Pagina'
import Confirmacion from '../components/comunes/Confirmacion'
import Competencias from '../components/comunes/Competencias'
import {
  Cargando,
  ErrorConsulta,
  EtiquetaEstado,
  Aviso,
} from '../components/comunes/Estados'
export default function Solicitud() {
  const { id } = useParams()
  const { usuario } = useSesion()
  const resultado = useConsulta(`/solicitudes/${id}`)
  const solicitud = resultado.datos
  const iniciativa = useConsulta(
    solicitud ? `/iniciativas/${solicitud.iniciativaId}` : null,
  )
  const [accion, setAccion] = useState('')
  const [aviso, setAviso] = useState('')
  const propia = solicitud?.solicitanteId === usuario._id
  const propietario = iniciativa.datos?.propietarioId === usuario._id
  const pendiente = solicitud?.estado === 'Pendiente'
  const puedeAceptar =
    propietario &&
    ['Publicada', 'En formación de equipo'].includes(iniciativa.datos.estado) &&
    iniciativa.datos.espaciosDisponibles > 0
  return (
    <Pagina
      titulo="Solicitud de participación"
      volver={{
        ruta: propietario
          ? `/iniciativa/${solicitud.iniciativaId}/solicitudes`
          : '/solicitudes',
        texto: 'Volver a las solicitudes',
      }}
    >
      <Aviso>{aviso}</Aviso>
      {resultado.cargando ? (
        <Cargando />
      ) : resultado.error ? (
        <ErrorConsulta error={resultado.error} recargar={resultado.recargar} />
      ) : (
        solicitud && (
          <>
            {iniciativa.cargando ? (
              <Cargando texto="Comprobando el acceso a la iniciativa…" />
            ) : iniciativa.error ? (
              <section aria-label="Consulta de la iniciativa" className="mb-4">
                <p>No pudimos comprobar el acceso y las acciones disponibles en la iniciativa. El detalle de la solicitud se conserva.</p>
                <ErrorConsulta error={iniciativa.error} recargar={iniciativa.recargar} />
              </section>
            ) : null}
            <div className="acciones mb-4">
              <EtiquetaEstado estado={solicitud.estado} />
              {propia && pendiente && (
                <>
                  <Link
                    className="btn btn-outline-primary"
                    to={`/solicitudes/${id}/editar`}
                  >
                    Editar solicitud
                  </Link>
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => setAccion('Cancelar')}
                  >
                    Cancelar solicitud
                  </button>
                </>
              )}
              {propietario && pendiente && (
                <>
                  <button
                    className="btn btn-primary"
                    disabled={!puedeAceptar}
                    onClick={() => setAccion('Aceptada')}
                  >
                    Aceptar solicitud
                  </button>
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => setAccion('Rechazada')}
                  >
                    Rechazar solicitud
                  </button>
                </>
              )}
            </div>
            {propietario && pendiente && !puedeAceptar && (
              <p className="alert alert-warning">
                Para aceptar debe haber espacio disponible y la iniciativa debe
                estar publicada o en formación de equipo.
              </p>
            )}
            <div className="row g-4">
              <div className="col-lg-8">
                <section className="seccion-detalle">
                  <h2>{solicitud.iniciativa?.titulo}</h2>
                  <Link to={`/iniciativa/${solicitud.iniciativaId}`}>
                    Consultar iniciativa
                  </Link>
                </section>
                <section className="seccion-detalle">
                  <h2>Solicitante</h2>
                  <Link to={`/usuarios/${solicitud.solicitanteId}`}>
                    {nombreCompleto(solicitud.solicitante)}
                  </Link>
                  <p>{solicitud.solicitante?.carrera}</p>
                  <Competencias valores={solicitud.solicitante?.competencias} />
                </section>
                <section className="seccion-detalle">
                  <h2>Mensaje</h2>
                  <p className="texto-largo">{solicitud.mensaje}</p>
                </section>
                {solicitud.respuesta && (
                  <section className="seccion-detalle">
                    <h2>Decisión del propietario</h2>
                    <p>
                      {solicitud.respuesta.decision} ·{' '}
                      {fecha(solicitud.respuesta.fechaDecision)}
                    </p>
                    <p className="texto-largo">
                      {solicitud.respuesta.comentario ||
                        'Sin comentario adicional.'}
                    </p>
                  </section>
                )}
              </div>
              <aside className="col-lg-4">
                <dl className="resumen-lateral datos-detalle">
                  <dt>Competencia ofrecida</dt>
                  <dd>{solicitud.competencia?.nombre}</dd>
                  <dt>Rol deseado</dt>
                  <dd>{solicitud.rol}</dd>
                  <dt>Disponibilidad</dt>
                  <dd>{solicitud.disponibilidad}</dd>
                  <dt>Fecha de solicitud</dt>
                  <dd>{fecha(solicitud.fechaSolicitud)}</dd>
                </dl>
              </aside>
            </div>
          </>
        )
      )}
      <Confirmacion
        abierta={Boolean(accion)}
        titulo={
          accion === 'Cancelar'
            ? 'Cancelar solicitud'
            : accion === 'Aceptada'
              ? 'Aceptar solicitud'
              : 'Rechazar solicitud'
        }
        descripcion={
          accion === 'Aceptada'
            ? 'La persona se incorporará al equipo con el rol indicado. La solicitud dejará de estar pendiente.'
            : accion === 'Cancelar'
              ? 'La solicitud se conservará como Cancelada y ya no se podrá editar.'
              : 'La solicitud se conservará como Rechazada y la persona no ingresará al equipo.'
        }
        textoConfirmar={
          accion === 'Aceptada'
            ? 'Aceptar solicitud'
            : accion === 'Cancelar'
              ? 'Sí, cancelar solicitud'
              : 'Rechazar solicitud'
        }
        pedirTexto={accion !== 'Cancelar'}
        etiquetaTexto="Comentario (opcional)"
        peligrosa={accion !== 'Aceptada'}
        onCerrar={() => setAccion('')}
        onConfirmar={async (comentario) => {
          await pedir(
            `/solicitudes/${id}/${accion === 'Cancelar' ? 'cancelacion' : 'resolucion'}`,
            'POST',
            accion === 'Cancelar'
              ? undefined
              : { decision: accion, comentario },
          )
          setAviso(
            accion === 'Aceptada'
              ? 'Solicitud aceptada. La persona ya pertenece al equipo.'
              : accion === 'Cancelar'
                ? 'Solicitud cancelada.'
                : 'Solicitud rechazada.',
          )
          resultado.recargar()
          iniciativa.recargar()
        }}
      />
    </Pagina>
  )
}
