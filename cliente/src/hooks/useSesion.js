import { useContext } from 'react'
import { ContextoSesion } from '../auth/contexto'
export function useSesion() {
  return useContext(ContextoSesion)
}
