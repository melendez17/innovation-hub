import { Link } from 'react-router-dom'
import Pagina from '../components/layout/Pagina'
export default function NoEncontrado() {
  return (
    <Pagina
      titulo="Página no encontrada"
      descripcion="La dirección no corresponde a una página de Innovation Hub."
    >
      <Link className="btn btn-primary" to="/catalogo">
        Volver al catálogo
      </Link>
    </Pagina>
  )
}
