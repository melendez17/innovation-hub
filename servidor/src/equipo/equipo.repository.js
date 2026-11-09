import { ObjectId } from 'mongodb'
import { obtenerDb } from '../config/db.js'

export async function listar(iniciativaId) {
  return obtenerDb().collection('miembros').find(
    { iniciativaId: new ObjectId(iniciativaId), estadoParticipacion: 'Activo' },
    { projection: { usuarioId: 1, rol: 1, fechaIncorporacion: 1 } }
  ).toArray()
}

export async function buscar(iniciativaId, usuarioId, session) {
  return obtenerDb().collection('miembros').findOne(
    { iniciativaId: new ObjectId(iniciativaId), usuarioId: new ObjectId(usuarioId) }, { session }
  )
}

export async function retirar(iniciativaId, usuarioId, fecha, motivo, session) {
  await obtenerDb().collection('miembros').updateOne(
    { iniciativaId: new ObjectId(iniciativaId), usuarioId: new ObjectId(usuarioId) },
    {
      $set: { estadoParticipacion: 'Retirado', fechaRetiro: fecha, motivoRetiro: motivo },
      // Para integrantes antiguos sin datos de incorporación, no inventar rol ni fecha.
      $setOnInsert: { rol: null, fechaIncorporacion: null },
    },
    { upsert: true, session }
  )
  return buscar(iniciativaId, usuarioId, session)
}
