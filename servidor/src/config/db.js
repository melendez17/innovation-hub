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
