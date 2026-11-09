import { opcionesTodas } from '../utils/opciones'
import { useListado } from '../hooks/useListado'
import { Link, useParams } from 'react-router-dom'
import { useConsulta } from '../hooks/useConsulta'
import { fecha, nombreCompleto } from '../utils/formatos'
import { ESTADOS_SOLICITUD } from '../datos/catalogos'
import Pagina from '../components/layout/Pagina'
import Listado, { Filtros } from '../components/comunes/Listado'
import {
  Cargando,
  ErrorConsulta,
  EtiquetaEstado,
} from '../components/comunes/Estados'
export default function Solicitudes() {
  const { id } = useParams()
  const iniciativa = useConsulta(id ? `/iniciativas/${id}` : null)
  const competencias = useConsulta('/competencias')
  const resultado = useListado(
    id ? `/iniciativas/${id}/solicitudes` : '/solicitudes',
    {
      estado: '',
      competenciaId: '',
      rol: '',
      desde: '',
      hasta: '',
      sort: '-fechaSolicitud',
    },
  )
  return (
    <Pagina
      titulo={id ? 'Solicitudes recibidas' : 'Mis solicitudes'}
      descripcion={
        id
          ? `Participación en ${iniciativa.datos?.titulo || 'tu iniciativa'}. Solo su propietario puede consultar esta lista.`
          : 'Consulta el estado de tus solicitudes. Las recibidas se encuentran en el detalle de cada iniciativa.'
      }
      volver={
        id
          ? { ruta: `/iniciativa/${id}`, texto: 'Volver a la iniciativa' }
          : undefined
      }
      acciones={
        !id && (
          <Link
            className="btn btn-outline-primary"
            to="/catalogo?ambito=propias"
          >
            Ver mis iniciativas
          </Link>
        )
      }
    >
      {id && iniciativa.cargando && <Cargando />}
      {iniciativa.error && (
        <ErrorConsulta
          error={iniciativa.error}
          recargar={iniciativa.recargar}
        />
      )}
      {competencias.error && (
        <ErrorConsulta
          error={competencias.error}
          recargar={competencias.recargar}
        />
      )}
      <Filtros
        key={JSON.stringify(resultado.valores)}
        valores={resultado.valores}
        aplicar={resultado.aplicar}
        campos={[
          {
            nombre: 'estado',
            etiqueta: 'Estado',
            opciones: opcionesTodas(ESTADOS_SOLICITUD),
          },
          {
            nombre: 'competenciaId',
            etiqueta: 'Competencia',
            opciones: [
              { valor: '', texto: 'Todas' },
              ...(competencias.datos || []).map((c) => ({
                valor: c._id,
                texto: c.nombre,
              })),
            ],
          },
          { nombre: 'rol', etiqueta: 'Rol deseado' },
          { nombre: 'desde', etiqueta: 'Desde', tipo: 'date' },
          { nombre: 'hasta', etiqueta: 'Hasta', tipo: 'date' },
          {
            nombre: 'sort',
            etiqueta: 'Orden',
            opciones: [
              { valor: '-fechaSolicitud', texto: 'Más recientes' },
              { valor: 'fechaSolicitud', texto: 'Más antiguas' },
            ],
          },
        ]}
      />
      <Listado
        resultado={resultado}
        vacio={
          id
            ? 'Aún no hay solicitudes recibidas con estos filtros.'
            : 'Explora el catálogo y solicita participar en una iniciativa.'
        }
      >
        {(items) => (
          <div className="tabla-contenedor" tabIndex={0} role="region" aria-label="Tabla desplazable horizontalmente">
            <table className="table">
              <caption className="visually-hidden">
                Solicitudes de participación
              </caption>
              <thead>
                <tr>
                  <th scope="col">{id ? 'Solicitante' : 'Iniciativa'}</th>
                  <th scope="col">Competencia y rol</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Fecha</th>
                  <th scope="col">Consulta</th>
                </tr>
              </thead>
              <tbody>
                {items.map((s) => (
                  <tr key={s._id}>
                    <td>
                      {id
                        ? nombreCompleto(s.solicitante)
                        : s.iniciativa?.titulo}
                    </td>
                    <td>
                      {s.competencia?.nombre}
                      <div className="small texto-secundario">{s.rol}</div>
                    </td>
                    <td>
                      <EtiquetaEstado estado={s.estado} />
                    </td>
                    <td>{fecha(s.fechaSolicitud)}</td>
                    <td>
                      <Link to={`/solicitudes/${s._id}`}>
                        Ver solicitud
                        <span className="visually-hidden">
                          {' '}
                          de{' '}
                          {id
                            ? nombreCompleto(s.solicitante)
                            : s.iniciativa?.titulo}
                        </span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Listado>
    </Pagina>
  )
}
