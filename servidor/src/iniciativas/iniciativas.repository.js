import { ObjectId } from 'mongodb'
import { obtenerDb } from '../config/db.js'

const coleccion = () => obtenerDb().collection('iniciativas')

const CON_NOMBRE_EMAIL = [
  {
    $lookup: {
      from: 'usuarios',
      localField: 'propietarioId',
      foreignField: '_id',
      as: 'propietario',
    }
  },
  { $unwind: '$propietario' },
  {
    $lookup: {
      from: 'usuarios',
      localField: 'miembrosIds',
      foreignField: '_id',
      as: 'miembrosDetalle'
    }
  },
  {
    $set: {
      propietario: {
        nombre: '$propietario.nombre',
        email: '$propietario.email'
      },
      miembros: {
        $map: {
          input: '$miembrosDetalle',
          as: 'miembro',
          in: {
            nombre: '$$miembro.nombre',
            email: '$$miembro.email'
          }
        }
      }
    }
  },
  {
    $project: { competencias: 0, carrera: 0 }
  }

]

export async function listar() {
  return coleccion()
    .find({}, { projection: { titulo: 1, tipo: 1, resumen: 1, descripcion: 1, problema: 1, beneficiados: 1, categoria: 1, competencias: 1, cantidadIntegrantes: 1, visibilidad: 1, etiquetas: 1, estado: 1, propietario: 1, miembros: 1, fechaCreacion: 1, ultimaFechaModificacion: 1 } })
    .sort({ titulo: 1 })
    .toArray()
}

export async function buscarPorID(id) {
  const [iniciativa] = await coleccion().aggregate([{ $match: { _id: new ObjectId(id) } }, ...CON_NOMBRE_EMAIL]).toArray()
  return iniciativa ?? null
}

export async function crear(iniciativa) {
  const resultado = await coleccion().insertOne(iniciativa)
  return resultado.insertedID
}