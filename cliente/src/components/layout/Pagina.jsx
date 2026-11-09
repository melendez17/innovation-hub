import { Link, useLocation } from 'react-router-dom'

function Pagina({ titulo, descripcion, acciones, volver, children }) {
  const ubicacion = useLocation()
  return (
    <div className="pagina">
      {volver && (
        <Link to={volver.ruta} className="enlace-volver">
          {volver.texto}
        </Link>
      )}
      {ubicacion.state?.mensaje && (
        <div role="status" className="alert alert-success">
          {ubicacion.state.mensaje}
        </div>
      )}
      <div className="cabecera-pagina">
        <div>
          <h1 tabIndex={-1}>{titulo}</h1>
          {descripcion && <p className="descripcion-pagina">{descripcion}</p>}
        </div>
        {acciones && <div className="acciones">{acciones}</div>}
      </div>
      {children}
    </div>
  )
}

export default Pagina
