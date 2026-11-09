import { ObjectId } from 'mongodb'
import * as repositorio from './solicitudes.repository.js'
import * as iniciativas from '../iniciativas/iniciativas.repository.js'
import { validarSolicitud } from './solicitudes.validacion.js'
import { revisarId } from '../utils/revisarId.js'
import { HttpError } from '../utils/HttpError.js'

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
