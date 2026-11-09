import { Navigate, useLocation } from 'react-router-dom'
import { useSesion } from '../hooks/useSesion'
import { Cargando } from '../components/comunes/Estados'

export default function RutaPrivada({ children }) {
  const { usuario, cargando } = useSesion()
  const ubicacion = useLocation()
  if (cargando) return <Cargando />
  if (!usuario)
    return (
      <Navigate
        to="/ingresar"
        replace
        state={{ desde: ubicacion.pathname + ubicacion.search }}
      />
    )
  return children
}
