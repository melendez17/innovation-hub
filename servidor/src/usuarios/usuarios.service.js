import * as repositorio from './usuarios.repository.js'
import { validarUsuario } from './usuarios.validacion.js'
import { HttpError } from '../utils/HttpError.js'
import { crearPasswordHash } from '../utils/password.js'
 
export async function listar() {
  return repositorio.listar()
}

export async function existe(id) {
  const usuario = await repositorio.buscarPorId(id, true)
  return usuario !== null
}

export async function crear(datos) {
  const errores =  validarUsuario(datos)
  if (Object.keys(errores).length > 0) {
    throw new HttpError(400, 'DATOS_INVALIDOS',
      'Revise los datos enviados.', errores)
  }

  const usuario = {
    nombre: datos.nombre.trim(),
    apellido1: datos.apellido1.trim(),
    apellido2: datos.apellido2?.trim() || null,
    email: datos.email.trim().toLowerCase(),
    passwordHash: await crearPasswordHash(datos.password),
    tipo:  datos.tipo, 
    carrera: datos.carrera.trim(),
    fechaRegistro: new Date(),
    estado: "Activa",
    disponibilidad: "",
    competencias: []
  }

  let id
  try {
    id = await repositorio.crear(usuario)
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.email) {
      throw new HttpError(409, 'CONFLICTO', 'Este correo electrónico ya está registrado.', {
        email: 'Utilice otro correo electrónico.',
      })
    }
    throw error
  }

  return repositorio.buscarPorId(id, false)
}
