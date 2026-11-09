import { ObjectId } from 'mongodb'

export function validarSolicitud(datos) {
  const errores = {}
  if (datos === null || typeof datos !== 'object' || Array.isArray(datos)) {
    return { cuerpo: 'Envíe un objeto con los datos de la solicitud.' }
  }
  if (typeof datos.mensaje !== 'string' || !datos.mensaje.trim()) {
    errores.mensaje = 'Escriba un mensaje de presentación.'
  }
  if (typeof datos.competenciaId !== 'string' || !ObjectId.isValid(datos.competenciaId)) {
    errores.competenciaId = 'Seleccione una competencia válida.'
  }
  if (typeof datos.rol !== 'string' || !datos.rol.trim()) {
    errores.rol = 'Indique el rol que desea desempeñar.'
  }
  if (typeof datos.disponibilidad !== 'string' || !datos.disponibilidad.trim()) {
    errores.disponibilidad = 'Indique su disponibilidad para participar.'
  }
  return errores
}
