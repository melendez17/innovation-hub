import { useEffect, useState } from 'react'
import { guardarToken, leerToken, pedir } from '../api/cliente'

import { ContextoSesion } from './contexto'

export function SesionProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(Boolean(leerToken()))
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    const controlador = new AbortController()
    const vencer = () => {
      setUsuario(null)
      setAviso(
        'Tu sesión venció o ya no está disponible. Inicia sesión de nuevo.',
      )
      setCargando(false)
    }
    window.addEventListener('sesion-vencida', vencer)
    if (leerToken()) {
      pedir('/sesiones/actual', 'GET', undefined, controlador.signal)
        .then((datos) => {
          if (!controlador.signal.aborted) setUsuario(datos.usuario)
        })
        .catch((error) => {
          if (!controlador.signal.aborted && error.estado !== 401)
            setAviso(
              'No pudimos comprobar tu sesión. Puedes volver a iniciar sesión.',
            )
        })
        .finally(() => {
          if (!controlador.signal.aborted) setCargando(false)
        })
    }
    return () => {
      controlador.abort()
      window.removeEventListener('sesion-vencida', vencer)
    }
  }, [])

  async function iniciarSesion(datos) {
    const sesion = await pedir('/sesiones', 'POST', datos)
    guardarToken(sesion.token)
    setUsuario(sesion.usuario)
    setAviso('')
  }

  async function cerrarSesion() {
    try {
      await pedir('/sesiones/actual', 'DELETE')
    } catch (error) {
      if (error.estado !== 401) throw error
    }
    guardarToken(null)
    setUsuario(null)
    setAviso('')
  }

  return (
    <ContextoSesion.Provider
      value={{
        usuario,
        cargando,
        aviso,
        quitarAviso: () => setAviso(''),
        iniciarSesion,
        cerrarSesion,
        actualizarUsuario: setUsuario,
      }}
    >
      {children}
    </ContextoSesion.Provider>
  )
}
