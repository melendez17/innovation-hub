import { ObjectId } from 'mongodb'
import { obtenerDb } from '../config/db.js'

const coleccion = () => obtenerDb().collection('iniciativas')

const CON_DETALLES = [
  // 1. Relación con el propietario
  {
    $lookup: {
      from: 'usuarios',
      localField: 'propietarioId',
      foreignField: '_id',
      as: 'propietario'
    }
  },
  { $unwind: '$propietario' },

  // 2. Relación con los miembros
  {
    $lookup: {
      from: 'usuarios',
      localField: 'miembros',
      foreignField: '_id',
      as: 'miembrosDetalle'
    }
  },

  // 3. Relación con las competencias (NUEVO)
  {
    $lookup: {
      from: 'competencias', // Asegúrate de que este sea el nombre exacto de la colección de competencias
      localField: 'competencias',
      foreignField: '_id',
      as: 'competenciasDetalle'
    }
  },

  // 4. Proyección directa y limpia de campos
  {
    $project: {
      titulo: 1,
      tipo: 1,
      resumen: 1,
      descripcion: 1,
      problema: 1,
      beneficiados: 1,
      categoria: 1,
      cantidadIntegrantes: 1,
      visibilidad: 1,
      etiquetas: 1,
      estado: 1,
      propietarioId: 1,
      fechaCreacion: 1,
      fechaUltimaModificacion: 1,
      // Formatear propietario
      propietario: {
        nombre: '$propietario.nombre',
        apellido1: '$propietario.apellido1',
        apellido2: { $ifNull: ['$propietario.apellido2', null] },
        email: '$propietario.email'
      },
      // Formatear la lista de miembros desde el lookup temporal
      miembros: {
        $map: {
          input: '$miembrosDetalle',
          as: 'miembro',
          in: {
            nombre: '$$miembro.nombre',
            apellido1: '$propietario.apellido1',
            apellido2: { $ifNull: ['$propietario.apellido2', null] },
            email: '$$miembro.email'
          }
        }
      },
      // Formatear la lista de competencias con _id y nombre (NUEVO)
      competencias: {
        $map: {
          input: '$competenciasDetalle',
          as: 'competencia',
          in: {
            _id: '$$competencia._id',
            nombre: '$$competencia.nombre'
          }
        }
      }
    }
  }
];

export async function listar() {
  return coleccion()
    .aggregate(CON_DETALLES)
    .sort({ titulo: 1 })
    .toArray()
}

export async function buscarPorID(id) {
  const objectId = typeof id === 'string' ? new ObjectId(id) : id
  const [iniciativa] = await coleccion()
    .aggregate([{ $match: { _id: objectId } }, ...CON_DETALLES])
    .toArray()

  return iniciativa ?? null
}

export async function crear(iniciativa) {
  const resultado = await coleccion().insertOne(iniciativa)
  return resultado.insertedId
}

export async function agregarMiembro(id, nuevoMiembroId){
  const resultado = await coleccion().updateOne(
    {_id: new ObjectId(id)},
    {
      $push: { miembros: new ObjectId(nuevoMiembroId)},
      $set: {fechaUltimaModificacion: new Date()}
    }
  )
  return resultado.matchedCount === 1
}

export async function eliminarMiembro(id, miembroId){
  const resultado = await coleccion().updateOne(
    {_id: new ObjectId(id)},
    {
      $pull: { miembros: new ObjectId(miembroId)},
      $set: {fechaUltimaModificacion: new Date()}
    }
  )
  return resultado.matchedCount === 1
}

export async function eliminar(id){
  const resultado =  await coleccion().deleteOne({ _id: new ObjectId(id)})
  return resultado.deletedCount === 1
}
