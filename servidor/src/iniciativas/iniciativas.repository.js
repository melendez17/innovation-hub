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
      fechaPublicacion: 1,
      fechaUltimaModificacion: 1,
      proyectoId: 1,
      integrantesActuales: { $size: { $ifNull: ['$miembros', []] } },
      espaciosDisponibles: { $max: [0, { $subtract: ['$cantidadIntegrantes', { $size: { $ifNull: ['$miembros', []] } }] }] },
      // Formatear propietario
      propietario: {
        _id: '$propietario._id',
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
            apellido1: '$$miembro.apellido1',
            apellido2: { $ifNull: ['$$miembro.apellido2', null] },
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

export async function listar(filtro, opciones) {
  const [items, total] = await Promise.all([
    coleccion().aggregate([
      { $match: filtro }, { $sort: opciones.orden }, { $skip: opciones.salto }, { $limit: opciones.size },
      ...CON_DETALLES,
    ]).toArray(),
    coleccion().countDocuments(filtro),
  ])
  return { items, total }
}

export async function consultarPorID(id, usuarioId) {
  const visibilidades = usuarioId ? ['Pública', 'Institucional', 'Restringida'] : ['Pública']
  const permisos = [{ visibilidad: { $in: visibilidades } }]
  const accesoAlEstado = [{ estado: { $ne: 'Borrador' } }]
  if (usuarioId) {
    const usuarioObjectId = new ObjectId(usuarioId)
    accesoAlEstado.push({ propietarioId: usuarioObjectId })
    permisos.push({
      visibilidad: 'Privada',
      $or: [{ propietarioId: usuarioObjectId }, { miembros: usuarioObjectId }],
    })
  }
  const [iniciativa] = await coleccion().aggregate([
    { $match: { _id: new ObjectId(id), $and: [{ $or: permisos }, { $or: accesoAlEstado }] } },
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

export async function publicar(id, propietarioId) {
  const ahora = new Date()
  const resultado = await coleccion().updateOne(
    { _id: new ObjectId(id), propietarioId: new ObjectId(propietarioId), estado: 'Borrador' },
    { $set: { estado: 'Publicada', fechaPublicacion: ahora, fechaUltimaModificacion: ahora } }
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

export async function retirarMiembro(id, propietarioId, miembroId, fecha, session){
  const resultado = await coleccion().updateOne(
    {
      _id: new ObjectId(id),
      propietarioId: new ObjectId(propietarioId),
      estado: { $ne: 'Archivada' },
      miembros: new ObjectId(miembroId),
    },
    {
      $pull: { miembros: new ObjectId(miembroId)},
      $set: {fechaUltimaModificacion: fecha}
    },
    { session }
  )
  return resultado.matchedCount === 1
}

export async function buscarDocumento(id, session) {
  return coleccion().findOne({ _id: new ObjectId(id) }, { session })
}

export async function incorporarMiembro(id, usuarioId, fecha, session) {
  const resultado = await coleccion().updateOne(
    {
      _id: new ObjectId(id),
      estado: { $in: ['Publicada', 'En formación de equipo'] },
      miembros: { $ne: new ObjectId(usuarioId) },
    },
    {
      $addToSet: { miembros: new ObjectId(usuarioId) },
      $set: { estado: 'En formación de equipo', fechaUltimaModificacion: fecha },
    },
    { session }
  )
  return resultado.matchedCount === 1
}

export async function tieneInformacionRelacionada(id, propietarioId) {
  const iniciativaId = new ObjectId(id)
  const db = obtenerDb()
  const solicitud = await db.collection('solicitudes').findOne({ iniciativaId }, { projection: { _id: 1 } })
  const proyecto = await db.collection('proyectos').findOne({ iniciativaId }, { projection: { _id: 1 } })
  const miembro = await db.collection('miembros').findOne(
    { iniciativaId, usuarioId: { $ne: new ObjectId(propietarioId) } }, { projection: { _id: 1 } }
  )
  return solicitud !== null || proyecto !== null || miembro !== null
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
