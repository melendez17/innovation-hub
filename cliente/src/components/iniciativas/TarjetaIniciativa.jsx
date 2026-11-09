import { Link } from 'react-router-dom'
import Competencias from '../comunes/Competencias'
import { EtiquetaEstado } from '../comunes/Estados'
import { nombreCompleto } from '../../utils/formatos'
export default function TarjetaIniciativa({ iniciativa }) {
  return (
    <article className="tarjeta-iniciativa">
      <div className="d-flex justify-content-between flex-wrap gap-2">
        <span className="tarjeta-tipo">
          {iniciativa.tipo} · {iniciativa.categoria}
        </span>
        <EtiquetaEstado estado={iniciativa.estado} />
      </div>
      <h2>
        <Link to={`/iniciativa/${iniciativa._id}`}>{iniciativa.titulo}</Link>
      </h2>
      <p className="tarjeta-resumen">{iniciativa.resumen}</p>
      <Competencias valores={iniciativa.competencias} />
      {iniciativa.propietario && (
        <p className="small texto-secundario">
          Por {nombreCompleto(iniciativa.propietario)}
        </p>
      )}
      {iniciativa.espaciosDisponibles !== undefined && (
        <p className="small">
          {iniciativa.espaciosDisponibles} espacios disponibles
        </p>
      )}
      <div className="tarjeta-pie">
        <span className="small texto-secundario">{iniciativa.visibilidad}</span>
        <Link
          className="btn btn-outline-primary btn-sm float-end"
          to={`/iniciativa/${iniciativa._id}`}
        >
          {iniciativa.accesoCompleto === false ? 'Ver resumen' : 'Ver detalle'}
        </Link>
      </div>
    </article>
  )
}
