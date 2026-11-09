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

export async function listarPropias(usuarioId) {
  return coleccion().find({ solicitanteId: new ObjectId(usuarioId) })
    .sort({ fechaSolicitud: -1, _id: 1 }).toArray()
}

export async function listarRecibidas(iniciativaId) {
  return coleccion().find({ iniciativaId: new ObjectId(iniciativaId) })
    .sort({ fechaSolicitud: -1, _id: 1 }).toArray()
}

export async function buscarPorId(id, session) {
  return coleccion().findOne({ _id: new ObjectId(id) }, { session })
}

export async function solicitanteActivo(id, session) {
  const usuario = await obtenerDb().collection('usuarios').findOne(
    { _id: new ObjectId(id), estado: 'Activa' }, { projection: { _id: 1 }, session }
  )
  return usuario !== null
}

export async function registrarMiembro(solicitud, fecha, session) {
  await obtenerDb().collection('miembros').updateOne(
    { iniciativaId: solicitud.iniciativaId, usuarioId: solicitud.solicitanteId },
    { $set: {
      rol: solicitud.rol,
      fechaIncorporacion: fecha,
      estadoParticipacion: 'Activo',
      fechaRetiro: null,
      motivoRetiro: null,
    } },
    { upsert: true, session }
  )
}

export async function resolver(id, respuesta, session) {
  const resultado = await coleccion().updateOne(
    { _id: new ObjectId(id), estado: 'Pendiente' },
    { $set: { estado: respuesta.decision, respuesta } },
    { session }
  )
  return resultado.matchedCount === 1
}

export async function modificar(id, solicitanteId, datos) {
  const resultado = await coleccion().updateOne(
    { _id: new ObjectId(id), solicitanteId: new ObjectId(solicitanteId), estado: 'Pendiente' },
    { $set: datos }
  )
  return resultado.matchedCount === 1
}

export async function cancelar(id, solicitanteId) {
  const resultado = await coleccion().updateOne(
    { _id: new ObjectId(id), solicitanteId: new ObjectId(solicitanteId), estado: 'Pendiente' },
    { $set: { estado: 'Cancelada' } }
  )
  return resultado.matchedCount === 1
}

export async function buscarCompetencia(id) {
  return obtenerDb().collection('competencias')
    .findOne({ _id: new ObjectId(id) }, { projection: { nombre: 1 } })
}
