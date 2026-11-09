import { createHash, randomBytes } from 'node:crypto'
import * as sesiones from './sesiones.repository.js'
import * as usuarios from '../usuarios/usuarios.repository.js'
import { verificarPassword } from '../utils/password.js'
import { HttpError } from '../utils/HttpError.js'

const DURACION_SESION_MS = 8 * 60 * 60 * 1000
const hashToken = (token) => createHash('sha256').update(token).digest('hex')

export async function crear(datos) {
  const esObjeto = datos !== null && typeof datos === 'object' && !Array.isArray(datos)
  if (!esObjeto ||
      typeof datos.email !== 'string' || datos.email.trim().length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email.trim()) ||
      typeof datos.password !== 'string' || datos.password.length < 1 || datos.password.length > 128) {
    throw new HttpError(400, 'DATOS_INVALIDOS', 'Envíe un correo válido y una contraseña.', {})
  }

  const cuenta = await usuarios.buscarParaLogin(datos.email.trim().toLowerCase())
  const coincide = await verificarPassword(datos.password, cuenta?.passwordHash)
  if (!cuenta || !coincide || cuenta.estado !== 'Activa') {
    throw new HttpError(401, 'CREDENCIALES_INVALIDAS', 'Correo o contraseña incorrectos.', {})
  }

  const usuario = await usuarios.buscarPorId(cuenta._id, false)
  if (!usuario || usuario.estado !== 'Activa') {
    throw new HttpError(401, 'CREDENCIALES_INVALIDAS', 'Correo o contraseña incorrectos.', {})
  }
  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + DURACION_SESION_MS)
  // Solo se guarda el hash del token, no el token que recibe el cliente.
  await sesiones.crear({ usuarioId: cuenta._id, tokenHash: hashToken(token), expiresAt })
  return { token, expiresAt, usuario }
}

export async function autenticar(authorization) {
  const coincidencia = typeof authorization === 'string' &&
    /^Bearer ([A-Za-z0-9_-]{43})$/i.exec(authorization)
  if (!coincidencia) {
    throw new HttpError(401, 'NO_AUTENTICADO', 'Debe iniciar sesión.', {})
  }
  const tokenHash = hashToken(coincidencia[1])
  const sesion = await sesiones.buscarVigente(tokenHash)
  const usuario = sesion && await usuarios.buscarPorId(sesion.usuarioId, false)
  if (!usuario || usuario.estado !== 'Activa') {
    throw new HttpError(401, 'NO_AUTENTICADO', 'La sesión no está disponible. Inicie sesión otra vez.', {})
  }
  return { tokenHash, expiresAt: sesion.expiresAt, usuario }
}

export async function cerrar(tokenHash) {
  await sesiones.eliminar(tokenHash)
}
