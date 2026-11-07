import { obtenerDb } from '../config/db.js'
 
const coleccion = () => obtenerDb().collection('iniciativas')

export async function listar() {
  return coleccion()
    .find({}, { projection: { titulo: 1, tipo: 1, resumen: 1, descripcion: 1,  problema: 0, beneficiados: 0, categoria: 1, competencias: 1, maxCupo: 1, visibilidad: 1, etiquetas: 0, estado: 1, propietario: 1, miembros: 1} })  // solo _id y nombre
    .sort({ titulo: 1 })
    .toArray()
}