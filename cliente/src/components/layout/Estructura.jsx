import { useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useSesion } from '../../hooks/useSesion'
import Encabezado from './Encabezado'
import { Cargando } from '../comunes/Estados'

export default function Estructura() {
  const { cargando, aviso, quitarAviso } = useSesion()
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    document.querySelector('main h1')?.focus()
  }, [pathname, cargando])
  return (
    <div className="estructura-app">
      <a className="saltar-contenido" href="#contenido">
        Saltar al contenido
      </a>
      <Encabezado />
      <main id="contenido" className="container contenido-app">
        {aviso && (
          <div className="alert alert-warning aviso-sesion" role="alert">
            <p className="mb-0">{aviso}</p>
            <button
              type="button"
              className="btn btn-link btn-sm"
              onClick={quitarAviso}
            >
              Cerrar aviso
            </button>
          </div>
        )}
        {cargando ? <Cargando texto="Comprobando tu sesión…" /> : <Outlet />}
      </main>
      <footer className="pie-app">
        <div className="container d-flex flex-wrap justify-content-between gap-2">
          <span>Innovation Hub · Comunidad universitaria</span>
          <Link to="/catalogo">Explorar iniciativas</Link>
        </div>
      </footer>
    </div>
  )
}
