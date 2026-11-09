import { ObjectId } from 'mongodb'
import { obtenerDb } from '../config/db.js'

const coleccion = () => obtenerDb().collection('solicitudes')

export async function existeCompetencia(id) {
  const competencia = await obtenerDb().collection('competencias')
    .findOne({ _id: new ObjectId(id) }, { projection: { _id: 1 } })
  return competencia !== null
}

export async function crear(solicitud) {
  const resultado = await coleccion().insertOne(solicitud)
  return { ...solicitud, _id: resultado.insertedId }
}
