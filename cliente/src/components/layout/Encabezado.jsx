import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLightbulb } from '@fortawesome/free-solid-svg-icons'
import { NavLink, useNavigate } from 'react-router-dom'
import { useSesion } from '../../hooks/useSesion'

function Encabezado() {
  const { usuario, cargando, cerrarSesion } = useSesion()
  const [abierto, setAbierto] = useState(false)
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState('')
  const navegar = useNavigate()
  async function salir() {
    setOcupado(true)
    setError('')
    try {
      await cerrarSesion()
      setAbierto(false)
      navegar('/', { state: { mensaje: 'Cerraste tu sesión.' } })
    } catch (fallo) {
      setError(fallo.message)
    } finally {
      setOcupado(false)
    }
  }
  const enlace = (ruta, texto, end = false) => (
    <li className="nav-item" key={ruta}>
      <NavLink
        to={ruta}
        end={end}
        className="nav-link"
        onClick={() => setAbierto(false)}
      >
        {texto}
      </NavLink>
    </li>
  )
  return (
    <header className="encabezado-app">
      <nav
        className="navbar navbar-expand-xl navbar-dark bg-primary"
        aria-label="Navegación principal"
      >
        <div className="container">
          <NavLink
            to="/"
            className="navbar-brand"
            onClick={() => setAbierto(false)}
          >
            <FontAwesomeIcon icon={faLightbulb} className="me-2" />
            Innovation Hub
          </NavLink>
          <button
            className="navbar-toggler"
            type="button"
            aria-controls="navegacion"
            aria-expanded={abierto}
            aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setAbierto(!abierto)}
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div
            id="navegacion"
            className={`collapse navbar-collapse${abierto ? ' show' : ''}`}
          >
            <ul className="navbar-nav ms-auto align-items-xl-center">
              {enlace('/', 'Inicio', true)}
              {enlace('/catalogo', 'Iniciativas')}
              {enlace('/proyectos', 'Proyectos')}
              {usuario && (
                <>
                  {enlace('/personas', 'Personas')}
                  {enlace('/solicitudes', 'Mis solicitudes')}
                  {enlace('/perfil', 'Mi perfil')}
                </>
              )}
              {!cargando && !usuario && (
                <>
                  {enlace('/ingresar', 'Ingresar')}
                  {enlace('/registro', 'Crear cuenta')}
                </>
              )}
              {usuario && (
                <li className="nav-item">
                  <button
                    type="button"
                    className="btn btn-salir"
                    disabled={ocupado}
                    onClick={salir}
                  >
                    {ocupado ? 'Cerrando sesión…' : 'Cerrar sesión'}
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
      {error && (
        <div className="container mt-2">
          <p className="alert alert-danger" role="alert">
            {error}
          </p>
        </div>
      )}
    </header>
  )
}

export default Encabezado
