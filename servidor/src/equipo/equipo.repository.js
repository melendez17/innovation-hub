import { ObjectId } from 'mongodb'
import { obtenerDb } from '../config/db.js'

export async function listar(iniciativaId) {
  return obtenerDb().collection('miembros').find(
    { iniciativaId: new ObjectId(iniciativaId), estadoParticipacion: 'Activo' },
    { projection: { usuarioId: 1, rol: 1, fechaIncorporacion: 1 } }
  ).toArray()
}
