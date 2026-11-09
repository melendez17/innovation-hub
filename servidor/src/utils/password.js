import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)

export async function crearPasswordHash(password) {
  const salt = randomBytes(16).toString('hex')
  const hash = await scryptAsync(password, salt, 64, {
    N: 32768,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  })
  // Conserva algoritmo, parámetros y sal para comprobarlo en el futuro login.
  return `scrypt$32768$8$1$${salt}$${hash.toString('hex')}`
}

// Hash ficticio: mantiene el trabajo de scrypt cuando el correo no existe.
const HASH_FICTICIO = `scrypt$32768$8$1$${'0'.repeat(32)}$${'0'.repeat(128)}`

export async function verificarPassword(password, passwordHash) {
  const formatoValido = typeof passwordHash === 'string' &&
    /^scrypt\$32768\$8\$1\$[a-f0-9]{32}\$[a-f0-9]{128}$/.test(passwordHash)
  const partes = (formatoValido ? passwordHash : HASH_FICTICIO).split('$')
  const calculado = await scryptAsync(password, partes[4], 64, {
    N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024,
  })
  const coincide = timingSafeEqual(calculado, Buffer.from(partes[5], 'hex'))
  return formatoValido && coincide
}
