import { ObjectId } from 'mongodb'
import { obtenerDb } from '../config/db.js'

const coleccion = () => obtenerDb().collection('usuarios')

// Lista explícita de campos públicos: nunca devolver credenciales, ni hashes.
const CAMPOS_PERFIL = {
  nombre: 1, apellido1: 1, apellido2: 1, email: 1, tipo: 1, carrera: 1,
  fechaRegistro: 1, estado: 1, disponibilidad: 1, competencias: 1,
  descripcionPersonal: 1, intereses: 1, portafolio: 1, fechaUltimaModificacion: 1,
}

const CAMPOS_PUBLICOS = {
  nombre: 1, apellido1: 1, apellido2: 1, tipo: 1, carrera: 1,
  disponibilidad: 1, competencias: 1, descripcionPersonal: 1, intereses: 1, portafolio: 1,
}

export async function listar(filtro, opciones) {
  const [items, total] = await Promise.all([
    coleccion().find(filtro, { projection: CAMPOS_PUBLICOS })
      .sort(opciones.orden).skip(opciones.salto).limit(opciones.size).toArray(),
    coleccion().countDocuments(filtro),
  ])
  return { items, total }
}

export async function buscarPublicoPorId(id) {
  return coleccion().findOne({ _id: new ObjectId(id), estado: 'Activa' }, { projection: CAMPOS_PUBLICOS })
}

export async function buscarPorId(id, esCorto) {
  let usuario
  if (esCorto) {
    usuario = coleccion().findOne(
      { _id: new ObjectId(id) },
      { projection: { nombre: 1, competencias: 1 } }
    )
  } else {
    usuario = coleccion().findOne({ _id: new ObjectId(id) }, { projection: CAMPOS_PERFIL })
  }
  
  return usuario
}

export async function crear(usuario) {
  const resultado = await coleccion().insertOne(usuario)
  return resultado.insertedId
}

export async function buscarCompetencias(ids) {
  return obtenerDb().collection('competencias')
    .find({ _id: { $in: ids.map(id => new ObjectId(id)) } }, { projection: { nombre: 1 } })
    .sort({ nombre: 1 })
    .toArray()
}

export async function modificarPerfil(id, datos) {
  const resultado = await coleccion().updateOne(
    { _id: new ObjectId(id), estado: 'Activa' },
    { $set: { ...datos, fechaUltimaModificacion: new Date() } }
  )
  return resultado.matchedCount === 1
}

// Uso interno de autenticación. Nunca devolver este documento desde un controlador.
export async function buscarParaLogin(email) {
  return coleccion().findOne(
    { email },
    { collation: { locale: 'en', strength: 2 }, projection: { passwordHash: 1, estado: 1 } }
  )
}
