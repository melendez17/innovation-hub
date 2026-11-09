import { useSearchParams } from 'react-router-dom'
import { useConsulta } from './useConsulta'
import { consulta } from '../api/cliente'

export function useListado(ruta, iniciales = {}) {
  const [parametros, setParametros] = useSearchParams()
  const valores = Object.fromEntries(
    Object.keys(iniciales).map((clave) => [
      clave,
      parametros.get(clave) || iniciales[clave],
    ]),
  )
  const pagina = parametros.get('page') || '1'
  const resultado = useConsulta(
    `${ruta}?${consulta({ ...valores, page: pagina, size: 12 })}`,
    true,
  )
  function aplicar(datos) {
    setParametros(consulta({ ...datos, page: 1 }))
  }
  function cambiarPagina(page) {
    setParametros(consulta({ ...valores, page }))
  }
  return { ...resultado, valores, aplicar, cambiarPagina }
}
