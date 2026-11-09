import { ObjectId } from 'mongodb'
import * as repositorio from './solicitudes.repository.js'
import * as iniciativas from '../iniciativas/iniciativas.repository.js'
import * as usuarios from '../usuarios/usuarios.repository.js'
import { validarSolicitud, validarResolucion } from './solicitudes.validacion.js'
import { conTransaccion } from '../config/db.js'
import { revisarId } from '../utils/revisarId.js'
import { HttpError } from '../utils/HttpError.js'

async function completarSolicitud(solicitud) {
  const iniciativa = await iniciativas.buscarDocumento(solicitud.iniciativaId)
  const usuario = await usuarios.buscarPorId(solicitud.solicitanteId, false)
  const competencia = await repositorio.buscarCompetencia(solicitud.competenciaId)
  const competencias = usuario ? await usuarios.buscarCompetencias(usuario.competencias ?? []) : []

  // Mostrar solo los datos necesarios, sin incluir el perfil privado ni credenciales.
  return {
    _id: solicitud._id,
    iniciativaId: solicitud.iniciativaId,
    solicitanteId: solicitud.solicitanteId,
    iniciativa: iniciativa ? { _id: iniciativa._id, titulo: iniciativa.titulo } : null,
    solicitante: usuario ? {
      _id: usuario._id,
      nombre: usuario.nombre,
      apellido1: usuario.apellido1,
      apellido2: usuario.apellido2 ?? null,
      carrera: usuario.carrera,
      tipo: usuario.tipo,
      competencias,
    } : null,
    mensaje: solicitud.mensaje,
    competenciaId: solicitud.competenciaId,
    competencia,
    rol: solicitud.rol,
    disponibilidad: solicitud.disponibilidad,
    fechaSolicitud: solicitud.fechaSolicitud,
    estado: solicitud.estado,
    respuesta: solicitud.respuesta ?? null,
  }
}

export async function listarPropias(usuarioId) {
  const solicitudes = await repositorio.listarPropias(usuarioId)
  return Promise.all(solicitudes.map(solicitud => completarSolicitud(solicitud)))
}

export async function listarRecibidas(iniciativaId, usuarioId) {
  revisarId(iniciativaId)
  const iniciativa = await iniciativas.buscarDocumento(iniciativaId)
  if (!iniciativa) {
    throw new HttpError(404, 'NO_ENCONTRADA', 'La iniciativa no existe.', {})
  }
  if (iniciativa.propietarioId.toString() !== usuarioId.toString()) {
    throw new HttpError(403, 'PROHIBIDO', 'Solo el propietario puede consultar las solicitudes recibidas.', {})
  }
  const solicitudes = await repositorio.listarRecibidas(iniciativaId)
  return Promise.all(solicitudes.map(solicitud => completarSolicitud(solicitud)))
}

export async function buscar(id, usuarioId) {
  revisarId(id)
  const solicitud = await repositorio.buscarPorId(id)
  if (!solicitud) {
    throw new HttpError(404, 'NO_ENCONTRADA', 'La solicitud no existe.', {})
  }
  const iniciativa = await iniciativas.buscarDocumento(solicitud.iniciativaId)
  const esSolicitante = solicitud.solicitanteId.toString() === usuarioId.toString()
  const esPropietario = iniciativa && iniciativa.propietarioId.toString() === usuarioId.toString()
  if (!esSolicitante && !esPropietario) {
    throw new HttpError(403, 'PROHIBIDO', 'No tiene permiso para consultar esta solicitud.', {})
  }
  return completarSolicitud(solicitud)
}

export async function modificar(id, datos, usuarioId) {
  revisarId(id)
  const solicitud = await repositorio.buscarPorId(id)
  if (!solicitud) {
    throw new HttpError(404, 'NO_ENCONTRADA', 'La solicitud no existe.', {})
  }
  if (solicitud.solicitanteId.toString() !== usuarioId.toString()) {
    throw new HttpError(403, 'PROHIBIDO', 'Solo el solicitante puede modificar esta solicitud.', {})
  }
  if (solicitud.estado !== 'Pendiente') {
    throw new HttpError(409, 'CONFLICTO', 'Solo puede modificar solicitudes pendientes.', {})
  }
  const errores = validarSolicitud(datos)
  if (Object.keys(errores).length > 0) {
    throw new HttpError(400, 'DATOS_INVALIDOS', 'Revise los datos enviados.', errores)
  }
  if (!(await repositorio.existeCompetencia(datos.competenciaId))) {
    throw new HttpError(400, 'DATOS_INVALIDOS', 'Revise los datos enviados.', {
      competenciaId: 'Esta competencia no existe.',
    })
  }
  const modificada = await repositorio.modificar(id, usuarioId, {
    mensaje: datos.mensaje.trim(),
    competenciaId: new ObjectId(datos.competenciaId),
    rol: datos.rol.trim(),
    disponibilidad: datos.disponibilidad.trim(),
  })
  if (!modificada) {
    throw new HttpError(409, 'CONFLICTO', 'La solicitud cambió. Consulte su estado e intente otra vez.', {})
  }
  return buscar(id, usuarioId)
}

export async function cancelar(id, usuarioId) {
  revisarId(id)
  const solicitud = await repositorio.buscarPorId(id)
  if (!solicitud) {
    throw new HttpError(404, 'NO_ENCONTRADA', 'La solicitud no existe.', {})
  }
  if (solicitud.solicitanteId.toString() !== usuarioId.toString()) {
    throw new HttpError(403, 'PROHIBIDO', 'Solo el solicitante puede cancelar esta solicitud.', {})
  }
  if (solicitud.estado !== 'Pendiente') {
    throw new HttpError(409, 'CONFLICTO', 'Solo puede cancelar solicitudes pendientes.', {})
  }
  const cancelada = await repositorio.cancelar(id, usuarioId)
  if (!cancelada) {
    throw new HttpError(409, 'CONFLICTO', 'La solicitud cambió. Consulte su estado e intente otra vez.', {})
  }
  return buscar(id, usuarioId)
}

export async function resolver(id, datos, usuarioId) {
  revisarId(id)
  const errores = validarResolucion(datos)
  if (Object.keys(errores).length > 0) {
    throw new HttpError(400, 'DATOS_INVALIDOS', 'Revise los datos enviados.', errores)
  }

  await conTransaccion(async session => {
    const solicitud = await repositorio.buscarPorId(id, session)
    if (!solicitud) {
      throw new HttpError(404, 'NO_ENCONTRADA', 'La solicitud no existe.', {})
    }
    const iniciativa = await iniciativas.buscarDocumento(solicitud.iniciativaId, session)
    if (!iniciativa) {
      throw new HttpError(404, 'NO_ENCONTRADA', 'La iniciativa no existe.', {})
    }
    if (iniciativa.propietarioId.toString() !== usuarioId.toString()) {
      throw new HttpError(403, 'PROHIBIDO', 'Solo el propietario puede resolver esta solicitud.', {})
    }
    if (solicitud.estado !== 'Pendiente') {
      throw new HttpError(409, 'CONFLICTO', 'Solo puede resolver solicitudes pendientes.', {})
    }

    const fecha = new Date()
    if (datos.decision === 'Aceptada') {
      if (!['Publicada', 'En formación de equipo'].includes(iniciativa.estado)) {
        throw new HttpError(409, 'CONFLICTO', 'La iniciativa ya no admite incorporaciones.', {})
      }
      if (iniciativa.miembros.some(idMiembro => idMiembro.toString() === solicitud.solicitanteId.toString())) {
        throw new HttpError(409, 'CONFLICTO', 'El solicitante ya forma parte del equipo.', {})
      }
      if (iniciativa.miembros.length >= iniciativa.cantidadIntegrantes) {
        throw new HttpError(409, 'CONFLICTO', 'No hay espacios disponibles en el equipo.', {})
      }
      if (!(await repositorio.solicitanteActivo(solicitud.solicitanteId, session))) {
        throw new HttpError(409, 'CONFLICTO', 'La cuenta del solicitante no está activa.', {})
      }
      const incorporado = await iniciativas.incorporarMiembro(iniciativa._id, solicitud.solicitanteId, fecha, session)
      if (!incorporado) {
        throw new HttpError(409, 'CONFLICTO', 'La iniciativa cambió. Consulte su estado e intente otra vez.', {})
      }
      await repositorio.registrarMiembro(solicitud, fecha, session)
    }

    const resuelta = await repositorio.resolver(id, {
      decision: datos.decision,
      comentario: datos.comentario?.trim() || null,
      fechaDecision: fecha,
    }, session)
    if (!resuelta) {
      throw new HttpError(409, 'CONFLICTO', 'La solicitud cambió. Consulte su estado e intente otra vez.', {})
    }
  })
  return buscar(id, usuarioId)
}

export async function crear(iniciativaId, datos, solicitanteId) {
  revisarId(iniciativaId)
  const iniciativa = await iniciativas.consultarPorID(iniciativaId, solicitanteId)
  if (!iniciativa) {
    throw new HttpError(404, 'NO_ENCONTRADA', 'La iniciativa no existe o no tiene acceso.', {})
  }
  if (iniciativa.propietarioId.toString() === solicitanteId.toString()) {
    throw new HttpError(403, 'PROHIBIDO', 'No puede solicitar participar en su propia iniciativa.', {})
  }
  if (!['Publicada', 'En formación de equipo'].includes(iniciativa.estado)) {
    throw new HttpError(409, 'CONFLICTO', 'La iniciativa no admite solicitudes en su estado actual.', {})
  }
  if (iniciativa.miembros.some(miembro => miembro._id.toString() === solicitanteId.toString())) {
    throw new HttpError(409, 'CONFLICTO', 'Ya forma parte del equipo de esta iniciativa.', {})
  }

  const errores = validarSolicitud(datos)
  if (Object.keys(errores).length > 0) {
    throw new HttpError(400, 'DATOS_INVALIDOS', 'Revise los datos enviados.', errores)
  }
  if (!(await repositorio.existeCompetencia(datos.competenciaId))) {
    throw new HttpError(400, 'DATOS_INVALIDOS', 'Revise los datos enviados.', {
      competenciaId: 'Esta competencia no existe.',
    })
  }

  const solicitud = {
    iniciativaId: new ObjectId(iniciativaId),
    solicitanteId: new ObjectId(solicitanteId),
    mensaje: datos.mensaje.trim(),
    competenciaId: new ObjectId(datos.competenciaId),
    rol: datos.rol.trim(),
    disponibilidad: datos.disponibilidad.trim(),
    fechaSolicitud: new Date(),
    estado: 'Pendiente',
  }
  try {
    return await repositorio.crear(solicitud)
  } catch (error) {
    if (error.code === 11000) {
      throw new HttpError(409, 'CONFLICTO', 'Ya tiene una solicitud pendiente para esta iniciativa.', {})
    }
    throw error
  }
}
