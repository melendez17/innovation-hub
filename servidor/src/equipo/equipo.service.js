import * as repositorio from './equipo.repository.js'
import * as iniciativas from '../iniciativas/iniciativas.repository.js'
import * as usuarios from '../usuarios/usuarios.repository.js'
import { revisarId } from '../utils/revisarId.js'
import { HttpError } from '../utils/HttpError.js'

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
