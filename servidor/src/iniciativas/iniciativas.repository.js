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
            _id: '$$miembro._id',
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

export async function listar(usuarioId) {
  // Las privadas no aparecen en el catálogo general, tampoco para su propietario.
  const visibilidades = usuarioId ? ['Pública', 'Institucional', 'Restringida'] : ['Pública']
  return coleccion()
    .aggregate([
      { $match: { estado: { $ne: 'Archivada' }, visibilidad: { $in: visibilidades } } },
      ...CON_DETALLES,
    ])
    .sort({ titulo: 1 })
    .toArray()
}

export async function consultarPorID(id, usuarioId) {
  const visibilidades = usuarioId ? ['Pública', 'Institucional', 'Restringida'] : ['Pública']
  const permisos = [{ visibilidad: { $in: visibilidades } }]
  if (usuarioId) {
    const usuarioObjectId = new ObjectId(usuarioId)
    permisos.push({
      visibilidad: 'Privada',
      $or: [{ propietarioId: usuarioObjectId }, { miembros: usuarioObjectId }],
    })
  }
  const [iniciativa] = await coleccion().aggregate([
    { $match: { _id: new ObjectId(id), $or: permisos } },
    ...CON_DETALLES,
  ]).toArray()
  return iniciativa ?? null
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

export async function modificar(id, propietarioId, datos, miembros) {
  const resultado = await coleccion().updateOne(
    {
      _id: new ObjectId(id),
      propietarioId: new ObjectId(propietarioId),
      estado: { $ne: 'Archivada' },
      miembros,
    },
    { $set: { ...datos, fechaUltimaModificacion: new Date() } }
  )
  return resultado.matchedCount === 1
}

export async function existenCompetencias(ids) {
  const identificadores = ids.map(id => new ObjectId(id))
  const cantidad = await obtenerDb().collection('competencias').countDocuments({ _id: { $in: identificadores } })
  return cantidad === new Set(identificadores.map(id => id.toString())).size
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

export async function buscarDocumento(id) {
  return coleccion().findOne({ _id: new ObjectId(id) })
}

export async function tieneSolicitudesOProyecto(id) {
  const iniciativaId = new ObjectId(id)
  const db = obtenerDb()
  const solicitud = await db.collection('solicitudes').findOne({ iniciativaId }, { projection: { _id: 1 } })
  const proyecto = await db.collection('proyectos').findOne({ iniciativaId }, { projection: { _id: 1 } })
  return solicitud !== null || proyecto !== null
}

export async function archivar(id, propietarioId) {
  const resultado = await coleccion().updateOne(
    { _id: new ObjectId(id), propietarioId: new ObjectId(propietarioId), estado: { $ne: 'Archivada' } },
    { $set: { estado: 'Archivada', fechaUltimaModificacion: new Date() } }
  )
  return resultado.modifiedCount === 1
}

export async function eliminar(id, propietarioId, miembros){
  const resultado = await coleccion().deleteOne({
    _id: new ObjectId(id),
    propietarioId: new ObjectId(propietarioId),
    // Si cambió el equipo mientras se comprobaban las relaciones, no borrar.
    miembros,
    proyectoId: null,
    estado: { $ne: 'Archivada' },
  })
  return resultado.deletedCount === 1
}
