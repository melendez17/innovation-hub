// config/db.js
// Abre UNA conexión a MongoDB al arrancar y la comparte con toda la aplicación.
 
import { MongoClient } from 'mongodb'
import { config } from './env.js'
 
const cliente = new MongoClient(config.mongoUri)
let db = null
 
export async function conectar() {
  await cliente.connect()
  db = cliente.db(config.nombreBd)
  // La base garantiza la unicidad incluso ante registros simultáneos.
  // Si ya hay correos duplicados, el arranque falla sin borrar ni alterar datos.
  await db.collection('usuarios').createIndex(
    { email: 1 },
    { name: 'usuarios_email_unico', unique: true, collation: { locale: 'en', strength: 2 } }
  )
  await db.collection('sesiones').createIndex({ tokenHash: 1 }, { unique: true })
  // TTL limpia documentos vencidos; el middleware comprueba la fecha en cada petición.
  await db.collection('sesiones').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
  // Un usuario no puede tener dos solicitudes pendientes para la misma iniciativa.
  await db.collection('solicitudes').createIndex(
    { iniciativaId: 1, solicitanteId: 1 },
    { unique: true, name: 'solicitud_pendiente_unica', partialFilterExpression: { estado: 'Pendiente' } }
  )
  await db.collection('miembros').createIndex({ iniciativaId: 1, usuarioId: 1 }, { unique: true })
  console.log(`Conectado a MongoDB: ${config.nombreBd}`)
}

export async function desconectar() {
  await cliente.close()
  db = null
}
 
export function obtenerDb() {
  if (!db) throw new Error('La base de datos todavía no está conectada')
  return db
}

// Guarda todos los cambios o ninguno. Requiere Atlas o un replica set local.
export async function conTransaccion(operacion) {
  return cliente.withSession(session => session.withTransaction(() => operacion(session)))
}
