import { ObjectId } from 'mongodb'

const TIPOS = ['Estudiante', 'Docente', 'Administrativo']

export function validarUsuario(datos) {
  const errores = {}
  if (datos === null || typeof datos !== 'object' || Array.isArray(datos)) {
    return { cuerpo: 'Envíe un objeto con los datos del usuario.' }
  }

  if (typeof datos.nombre !== 'string' || datos.nombre.trim().length < 2 || datos.nombre.trim().length > 200) {
    errores.nombre = 'Escriba un nombre de entre 2 y 200 caracteres.'
  }

  if (typeof datos.apellido1 !== 'string' || datos.apellido1.trim().length < 2 || datos.apellido1.trim().length > 200) {
    errores.apellido1 = 'Escriba un apellido de entre 2 y 200 caracteres.'
  }

  if (typeof datos.carrera !== 'string' || datos.carrera.trim().length < 2 || datos.carrera.trim().length > 200) {
    errores.carrera = 'Escriba una carrera de entre 2 y 200 caracteres.'
  }

  if (datos.apellido2 !== undefined && datos.apellido2 !== null &&
      (typeof datos.apellido2 !== 'string' ||
       (datos.apellido2.trim() !== '' && datos.apellido2.trim().length < 2) ||
       datos.apellido2.trim().length > 200)) {
    errores.apellido2 = 'Escriba entre 2 y 200 caracteres o deje el campo vacío.'
  }

  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (typeof datos.email !== 'string' || datos.email.trim().length > 254 || !regexEmail.test(datos.email.trim())) {
    errores.email = 'Escriba un correo electrónico válido.'
  }

  if (typeof datos.password !== 'string' || datos.password.length < 8 || datos.password.length > 128 || !datos.password.trim()) {
    errores.password = 'Use una contraseña de entre 8 y 128 caracteres.'
  }
  if (typeof datos.confirmacionPassword !== 'string' || datos.confirmacionPassword !== datos.password) {
    errores.confirmacionPassword = 'La confirmación debe coincidir con la contraseña.'
  }

  if (!TIPOS.includes(datos.tipo)) {
    errores.tipo = 'Elija Estudiante, Docente o Administrativo.'
  }
  if (datos.aceptaTerminos !== true) {
    errores.aceptaTerminos = 'Debe aceptar los términos de utilización.'
  }

  return errores
}

export function validarPerfil(datos) {
  const errores = {}
  if (datos === null || typeof datos !== 'object' || Array.isArray(datos)) {
    return { cuerpo: 'Envíe un objeto con los datos del perfil.' }
  }

  if (typeof datos.nombre !== 'string' || datos.nombre.trim().length < 2 || datos.nombre.trim().length > 200) {
    errores.nombre = 'Escriba un nombre de entre 2 y 200 caracteres.'
  }
  if (typeof datos.apellido1 !== 'string' || datos.apellido1.trim().length < 2 || datos.apellido1.trim().length > 200) {
    errores.apellido1 = 'Escriba un apellido de entre 2 y 200 caracteres.'
  }
  if (typeof datos.carrera !== 'string' || datos.carrera.trim().length < 2 || datos.carrera.trim().length > 200) {
    errores.carrera = 'Escriba una carrera de entre 2 y 200 caracteres.'
  }
  if (datos.apellido2 != null &&
      (typeof datos.apellido2 !== 'string' ||
       (datos.apellido2.trim() !== '' && datos.apellido2.trim().length < 2) || datos.apellido2.trim().length > 200)) {
    errores.apellido2 = 'Escriba entre 2 y 200 caracteres o deje el campo vacío.'
  }
  if (datos.descripcionPersonal != null && typeof datos.descripcionPersonal !== 'string') {
    errores.descripcionPersonal = 'Escriba la descripción personal como texto.'
  }
  if (datos.disponibilidad != null && typeof datos.disponibilidad !== 'string') {
    errores.disponibilidad = 'Escriba su disponibilidad como texto.'
  }
  if (datos.intereses !== undefined &&
      (!Array.isArray(datos.intereses) || datos.intereses.some(interes => typeof interes !== 'string' || !interes.trim()))) {
    errores.intereses = 'Envíe una lista de intereses de texto no vacíos.'
  }

  if (datos.portafolio != null && datos.portafolio !== '') {
    try {
      if (typeof datos.portafolio !== 'string') throw new Error()
      const url = new URL(datos.portafolio)
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error()
    } catch {
      errores.portafolio = 'Escriba una dirección web válida para su portafolio.'
    }
  }

  if (datos.competencias !== undefined) {
    if (!Array.isArray(datos.competencias) ||
        datos.competencias.some(id => typeof id !== 'string' || !ObjectId.isValid(id))) {
      errores.competencias = 'Seleccione una lista de competencias válidas.'
    } else if (new Set(datos.competencias.map(id => id.toLowerCase())).size !== datos.competencias.length) {
      errores.competencias = 'No puede repetir competencias.'
    }
  }
  return errores
}
