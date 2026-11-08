import { obtenerDb } from '../config/db.js'
 
const coleccion = () => obtenerDb().collection('competencias')

export async function listar() {
  return coleccion()
    .find({}, { projection: {nombre: 1} })
    .sort({ nombre: 1 })
    .toArray()
}