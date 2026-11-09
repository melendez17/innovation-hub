const URL_API = import.meta.env.VITE_API_URL?.replace(/\/$/, '')
const CLAVE = 'innovation-hub-sesion'
let tokenMemoria = null

export function leerToken() {
  try {
    return sessionStorage.getItem(CLAVE) || tokenMemoria
  } catch {
    return tokenMemoria
  }
}

export function guardarToken(token) {
  tokenMemoria = token
  try {
    if (token) sessionStorage.setItem(CLAVE, token)
    else sessionStorage.removeItem(CLAVE)
  } catch {
    /* La sesión actual sigue disponible en memoria. */
  }
}

export function consulta(parametros) {
  const valores = new URLSearchParams()
  for (const [nombre, valor] of Object.entries(parametros)) {
    if (valor !== '' && valor !== undefined && valor !== null)
      valores.set(nombre, String(valor))
  }
  return valores.toString()
}

export async function pedir(ruta, metodo = 'GET', datos, signal) {
  if (!URL_API)
    throw new Error(
      'El servicio no está configurado. Contacta a la persona administradora.',
    )
  const token = leerToken()
  const headers = { Accept: 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  if (datos !== undefined) headers['Content-Type'] = 'application/json'
  const controlador = new AbortController()
  const cancelar = () => controlador.abort()
  if (signal?.aborted) cancelar()
  signal?.addEventListener('abort', cancelar, { once: true })
  const temporizador = setTimeout(cancelar, 20000)
  try {
    const respuesta = await fetch(URL_API + ruta, {
      method: metodo,
      headers,
      signal: controlador.signal,
      body: datos === undefined ? undefined : JSON.stringify(datos),
    })
    if (respuesta.status === 204) return null
    let cuerpo
    try {
      cuerpo = await respuesta.json()
    } catch {
      throw new Error(
        'El servicio devolvió una respuesta inesperada. Inténtalo de nuevo.',
      )
    }
    if (!respuesta.ok) {
      const error = new Error(
        cuerpo.error?.mensaje || 'No se pudo completar la operación.',
      )
      error.estado = respuesta.status
      error.detalles = cuerpo.error?.detalles || {}
      if (respuesta.status === 401 && token && token === leerToken()) {
        guardarToken(null)
        window.dispatchEvent(new Event('sesion-vencida'))
      }
      throw error
    }
    return cuerpo
  } catch (error) {
    if (signal?.aborted) throw error
    if (error.name === 'AbortError')
      throw new Error('La conexión tardó demasiado. Inténtalo de nuevo.')
    if (error instanceof TypeError)
      throw new Error(
        'No se pudo conectar con el servicio. Revisa tu conexión e inténtalo de nuevo.',
      )
    throw error
  } finally {
    clearTimeout(temporizador)
    signal?.removeEventListener('abort', cancelar)
  }
}
