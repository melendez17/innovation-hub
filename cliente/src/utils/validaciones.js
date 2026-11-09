import {
  CATEGORIAS,
  TIPOS,
  TIPOS_MIEMBRO,
  VISIBILIDADES,
} from '../datos/catalogos'

const correoValido = (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim())
function personales(datos) {
  const errores = {}
  if (datos.nombre.trim().length < 2 || datos.nombre.trim().length > 200)
    errores.nombre = 'Escribe un nombre de entre 2 y 200 caracteres.'
  if (datos.apellido1.trim().length < 2 || datos.apellido1.trim().length > 200)
    errores.apellido1 =
      'Escribe un primer apellido de entre 2 y 200 caracteres.'
  if (
    datos.apellido2.trim() &&
    (datos.apellido2.trim().length < 2 || datos.apellido2.trim().length > 200)
  )
    errores.apellido2 =
      'Revisa el segundo apellido; debe tener entre 2 y 200 caracteres.'
  if (datos.carrera.trim().length < 2 || datos.carrera.trim().length > 200)
    errores.carrera = 'Escribe una carrera o área de entre 2 y 200 caracteres.'
  return errores
}

export function validarRegistro(datos) {
  const errores = personales(datos)
  if (!correoValido(datos.email) || datos.email.trim().length > 254)
    errores.email = 'Escribe un correo electrónico válido.'
  if (
    datos.password.length < 8 ||
    datos.password.length > 128 ||
    !datos.password.trim()
  )
    errores.password = 'La contraseña debe tener entre 8 y 128 caracteres.'
  if (datos.confirmacionPassword !== datos.password)
    errores.confirmacionPassword = 'Las contraseñas deben coincidir.'
  if (!TIPOS_MIEMBRO.includes(datos.tipo))
    errores.tipo = 'Selecciona tu tipo de miembro.'
  if (!datos.aceptaTerminos)
    errores.aceptaTerminos = 'Debes aceptar los términos de utilización.'
  return errores
}

export function validarLogin(datos) {
  const errores = {}
  if (!correoValido(datos.email))
    errores.email = 'Escribe un correo electrónico válido.'
  if (!datos.password || datos.password.length > 128)
    errores.password = 'Escribe tu contraseña.'
  return errores
}

export function validarPerfil(datos) {
  const errores = personales(datos)
  if (datos.portafolio.trim()) {
    try {
      if (!['https:', 'http:'].includes(new URL(datos.portafolio).protocol))
        throw new Error()
    } catch {
      errores.portafolio =
        'Escribe una dirección web válida para tu portafolio.'
    }
  }
  return errores
}

export function validarIniciativa(datos, miembrosActuales = 1) {
  const errores = {}
  if (datos.titulo.trim().length < 2)
    errores.titulo = 'Escribe un título de al menos dos caracteres.'
  if (datos.resumen.trim().length < 2)
    errores.resumen = 'Escribe un resumen de al menos dos caracteres.'
  if (datos.descripcion.trim().length < 2)
    errores.descripcion = 'Escribe una descripción de al menos dos caracteres.'
  if (!TIPOS.includes(datos.tipo))
    errores.tipo = 'Selecciona idea, necesidad o reto.'
  if (!CATEGORIAS.includes(datos.categoria))
    errores.categoria = 'Selecciona una categoría.'
  if (!VISIBILIDADES.includes(datos.visibilidad))
    errores.visibilidad = 'Selecciona un nivel de visibilidad.'
  const cantidad = Number(datos.cantidadIntegrantes)
  if (
    !datos.cantidadIntegrantes ||
    !Number.isInteger(cantidad) ||
    cantidad < Math.max(1, miembrosActuales)
  )
    errores.cantidadIntegrantes = `El cupo debe ser entero y de al menos ${Math.max(1, miembrosActuales)}, contando al propietario.`
  return errores
}

export function validarSolicitud(datos) {
  const errores = {}
  if (!datos.mensaje.trim())
    errores.mensaje = 'Escribe un mensaje de presentación.'
  if (!datos.competenciaId)
    errores.competenciaId = 'Selecciona la competencia principal que ofreces.'
  if (!datos.rol.trim()) errores.rol = 'Indica el rol que deseas desempeñar.'
  if (!datos.disponibilidad.trim())
    errores.disponibilidad = 'Indica tu disponibilidad.'
  return errores
}

function diaValido(valor) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false
  const fecha = new Date(`${valor}T00:00:00Z`)
  return (
    !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor
  )
}

export function validarProyecto(datos) {
  const errores = {}
  for (const campo of ['nombre', 'descripcion', 'objetivo'])
    if (datos[campo].trim().length < 2)
      errores[campo] =
        `Completa ${campo === 'nombre' ? 'el nombre' : campo === 'objetivo' ? 'el objetivo' : 'la descripción'} con al menos dos caracteres.`
  if (!diaValido(datos.fechaInicio))
    errores.fechaInicio = 'Selecciona una fecha de inicio válida.'
  if (
    datos.fechaFinEstimada &&
    (!diaValido(datos.fechaFinEstimada) ||
      datos.fechaFinEstimada < datos.fechaInicio)
  )
    errores.fechaFinEstimada =
      'La fecha final no puede ser anterior a la de inicio.'
  if (datos.repositorioUrl.trim()) {
    try {
      const url = new URL(datos.repositorioUrl)
      if (
        url.origin !== 'https://github.com' ||
        url.username ||
        url.password ||
        url.hash ||
        url.search ||
        !/^\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/.test(url.pathname)
      )
        throw new Error()
    } catch {
      errores.repositorioUrl =
        'Utiliza una dirección como https://github.com/propietario/repositorio.'
    }
  }
  return errores
}
