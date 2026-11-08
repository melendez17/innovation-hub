import { obtenerDb } from '../config/db.js'
 
const coleccion = () => obtenerDb().collection('usuarios')

export async function listar() {
  return coleccion()
    .find({}, { projection: { nombre: 1, correo: 1, competencias: 1} })
    .sort({ nombre: 1 })
    .toArray()
}