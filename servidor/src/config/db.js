// config/db.js
// Abre UNA conexión a MongoDB al arrancar y la comparte con toda la aplicación.
 
import { MongoClient } from 'mongodb'
import { config } from './env.js'
 
const cliente = new MongoClient(config.mongoUri)
let db = null
 
export async function conectar() {
  await cliente.connect()
  db = cliente.db(config.nombreBd)
  console.log(`Conectado a MongoDB: ${config.nombreBd}`)
}
 
export function obtenerDb() {
  if (!db) throw new Error('La base de datos todavía no está conectada')
  return db
}
