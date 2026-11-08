import { ObjectId } from 'mongodb'
import * as repositorio from './usuarios.repository.js'
import { validarUsuario } from './usuarios.validacion.js'
import { HttpError } from '../utils/HttpError.js'
 
export async function listar() {
  return repositorio.listar()
}

export async function existe(id) {
  const usuario = await repositorio.buscarPorId(id)
  return usuario !== null
}

export async function crear(datos) {
  const errores =  validarUsuario(datos)
  if (Object.keys(errores).length > 0) {
    throw new HttpError(400, 'DATOS_INVALIDOS',
      'Revise los datos enviados.', errores)
  }

  const id = await repositorio.crear({
    nombre: datos.nombre,
    apellido1: datos.apellido1,
    apellido2: datos.apellido2 ?? null,
    email: datos.email,
    password: datos.password,
    tipo:  datos.tipo, 
    carrera: datos.carrera, 
    fechaRegistro: new Date(),
    estado: "Activa",
    disponibilidad: "",
    competencias: []
  })

  return repositorio.buscarPorId(id)
}