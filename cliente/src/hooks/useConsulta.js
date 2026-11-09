import { useCallback, useEffect, useState } from 'react'
import { pedir } from '../api/cliente'
import { useSesion } from './useSesion'

export function useConsulta(ruta, paginada = false) {
  const { usuario } = useSesion()
  const [revision, setRevision] = useState(0)
  const clave = `${ruta}|${usuario?._id || ''}|${revision}`
  const [estado, setEstado] = useState({
    clave: '',
    datos: null,
    cargando: Boolean(ruta),
    error: null,
  })
  useEffect(() => {
    const controlador = new AbortController()
    if (!ruta) {
      return () => controlador.abort()
    }
    pedir(ruta, 'GET', undefined, controlador.signal)
      .then((datos) => {
        if (
          paginada &&
          (!Array.isArray(datos?.items) || !Number.isInteger(datos.total))
        ) {
          throw new Error('No pudimos leer los resultados. Inténtalo de nuevo.')
        }
        if (!controlador.signal.aborted)
          setEstado({ clave, datos, cargando: false, error: null })
      })
      .catch((error) => {
        if (!controlador.signal.aborted)
          setEstado({ clave, datos: null, cargando: false, error })
      })
    return () => controlador.abort()
  }, [ruta, usuario?._id, revision, paginada, clave])
  const recargar = useCallback(() => setRevision((valor) => valor + 1), [])
  const actual =
    estado.clave === clave
      ? estado
      : { datos: null, cargando: Boolean(ruta), error: null }
  return { ...actual, recargar }
}
