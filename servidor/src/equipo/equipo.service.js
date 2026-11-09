import * as repositorio from './equipo.repository.js'
import * as iniciativas from '../iniciativas/iniciativas.repository.js'
import * as usuarios from '../usuarios/usuarios.repository.js'
import { revisarId } from '../utils/revisarId.js'
import { HttpError } from '../utils/HttpError.js'
import { conTransaccion } from '../config/db.js'

export async function listar(iniciativaId, usuarioId) {
  revisarId(iniciativaId)
  const iniciativa = await iniciativas.consultarPorID(iniciativaId, usuarioId)
  if (!iniciativa) {
    throw new HttpError(404, 'NO_ENCONTRADA', 'La iniciativa no existe o no tiene acceso.', {})
  }
  const esPropietario = usuarioId && iniciativa.propietarioId.toString() === usuarioId.toString()
  const esMiembro = usuarioId && iniciativa.miembros.some(miembro => miembro._id.toString() === usuarioId.toString())
  if (iniciativa.visibilidad === 'Restringida' && !esPropietario && !esMiembro) {
    throw new HttpError(403, 'PROHIBIDO', 'No tiene acceso al equipo de esta iniciativa.', {})
  }

  const participaciones = await repositorio.listar(iniciativaId)
  return Promise.all(iniciativa.miembros.map(async miembro => {
    const usuario = await usuarios.buscarPorId(miembro._id, false)
    const participacion = participaciones.find(item => item.usuarioId.toString() === miembro._id.toString())
    const propietario = iniciativa.propietarioId.toString() === miembro._id.toString()
    return {
      usuarioId: usuario._id,
      nombre: usuario.nombre,
      apellido1: usuario.apellido1,
      apellido2: usuario.apellido2 ?? null,
      carrera: usuario.carrera,
      competencias: await usuarios.buscarCompetencias(usuario.competencias ?? []),
      rol: propietario ? 'Propietario' : participacion?.rol ?? null,
      fechaIncorporacion: propietario ? iniciativa.fechaCreacion : participacion?.fechaIncorporacion ?? null,
    }
  }))
}

export async function retirar(iniciativaId, miembroId, datos, usuarioId) {
  revisarId(iniciativaId)
  revisarId(miembroId)
  if (datos === null || typeof datos !== 'object' || Array.isArray(datos) ||
      (datos.motivo != null && typeof datos.motivo !== 'string')) {
    throw new HttpError(400, 'DATOS_INVALIDOS', 'El motivo debe ser texto y es opcional.', {})
  }

  return conTransaccion(async session => {
    const iniciativa = await iniciativas.buscarDocumento(iniciativaId, session)
    if (!iniciativa) {
      throw new HttpError(404, 'NO_ENCONTRADA', 'La iniciativa no existe.', {})
    }
    if (iniciativa.propietarioId.toString() !== usuarioId.toString()) {
      throw new HttpError(403, 'PROHIBIDO', 'Solo el propietario puede retirar integrantes.', {})
    }
    if (iniciativa.propietarioId.toString() === miembroId.toString()) {
      throw new HttpError(409, 'CONFLICTO', 'El propietario no puede retirarse a sí mismo.', {})
    }
    if (iniciativa.estado === 'Archivada') {
      throw new HttpError(409, 'CONFLICTO', 'No se puede modificar el equipo de una iniciativa archivada.', {})
    }
    const participacion = await repositorio.buscar(iniciativaId, miembroId, session)
    if (participacion?.estadoParticipacion === 'Retirado') {
      throw new HttpError(409, 'CONFLICTO', 'El integrante ya fue retirado.', {})
    }
    if (!iniciativa.miembros.some(id => id.toString() === miembroId.toString())) {
      throw new HttpError(404, 'NO_ENCONTRADA', 'El usuario no es integrante del equipo.', {})
    }

    const fecha = new Date()
    const retirado = await iniciativas.retirarMiembro(iniciativaId, usuarioId, miembroId, fecha, session)
    if (!retirado) {
      throw new HttpError(409, 'CONFLICTO', 'El equipo cambió. Consulte su estado e intente otra vez.', {})
    }
    return repositorio.retirar(iniciativaId, miembroId, fecha, datos.motivo?.trim() || null, session)
  })
}
