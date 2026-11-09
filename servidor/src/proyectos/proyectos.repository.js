import { ObjectId } from 'mongodb'
import { obtenerDb } from '../config/db.js'

const coleccion = () => obtenerDb().collection('proyectos')

export async function crear(proyecto, session) {
  const resultado = await coleccion().insertOne(proyecto, { session })
  return resultado.insertedId
}

export async function buscarPorId(id) {
  return coleccion().findOne({ _id: new ObjectId(id) })
}

export async function listar(filtro, opciones) {
  const [resultado] = await coleccion().aggregate([
    { $lookup: { from: 'iniciativas', localField: 'iniciativaId', foreignField: '_id', as: 'iniciativa' } },
    { $unwind: '$iniciativa' },
    { $match: filtro },
    { $facet: {
      items: [{ $sort: opciones.orden }, { $skip: opciones.salto }, { $limit: opciones.size }, { $project: { _id: 1 } }],
      conteo: [{ $count: 'total' }],
    } },
  ]).toArray()
  return { items: resultado.items, total: resultado.conteo[0]?.total ?? 0 }
}
