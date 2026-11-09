import { obtenerDb } from '../config/db.js'

const coleccion = () => obtenerDb().collection('sesiones')

export async function crear(sesion) {
  await coleccion().insertOne(sesion)
}

export async function buscarVigente(tokenHash) {
  return coleccion().findOne({ tokenHash, expiresAt: { $gt: new Date() } })
}

export async function eliminar(tokenHash) {
  await coleccion().deleteOne({ tokenHash })
}
