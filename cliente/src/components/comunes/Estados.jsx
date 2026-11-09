import { Link } from 'react-router-dom'

export function Cargando({ texto = 'Cargando información…' }) {
  return (
    <div className="estado-consulta" role="status">
      <span
        className="spinner-border spinner-border-sm me-2"
        aria-hidden="true"
      />
      {texto}
    </div>
  )
}

export function ErrorConsulta({ error, recargar }) {
  return (
    <div className="alert alert-danger" role="alert">
      <p className="mb-2">
        {error?.message || 'No pudimos cargar la información.'}
      </p>
      <div className="d-flex flex-wrap gap-2">
        {recargar && (
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={recargar}
          >
            Intentar de nuevo
          </button>
        )}
        <Link className="btn btn-link btn-sm" to="/catalogo">
          Ir al catálogo
        </Link>
      </div>
    </div>
  )
}

export function Vacio({ titulo = 'No encontramos resultados', children }) {
  return (
    <div className="estado-vacio">
      <h2 className="h5">{titulo}</h2>
      {children}
    </div>
  )
}

export function Aviso({ children }) {
  return children ? (
    <div className="alert alert-success" role="status">
      {children}
    </div>
  ) : null
}

export function EtiquetaEstado({ estado }) {
  const clase = [
    'Aceptada',
    'Publicada',
    'En formación de equipo',
    'Convertida en proyecto',
  ].includes(estado)
    ? 'estado-positivo'
    : ['Archivada', 'Rechazada', 'Cancelada'].includes(estado)
      ? 'estado-cerrado'
      : 'estado-pendiente'
  return estado ? (
    <span className={`etiqueta-estado ${clase}`}>{estado}</span>
  ) : null
}
