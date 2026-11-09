import { randomBytes, scrypt } from 'node:crypto'
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
