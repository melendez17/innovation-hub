import * as repositorio from './usuarios.repository.js'
import { ObjectId } from 'mongodb'
import { validarUsuario, validarPerfil } from './usuarios.validacion.js'
import { HttpError } from '../utils/HttpError.js'
import { crearPasswordHash } from '../utils/password.js'
import { leerPaginacion, pagina, buscarTexto } from '../utils/paginacion.js'
import { revisarId } from '../utils/revisarId.js'
 
export async function listar(query = {}) {
  const opciones = leerPaginacion(query, ['q', 'competenciaId', 'carrera', 'disponibilidad'], ['nombre', 'apellido1'], 'nombre')
  const filtro = { estado: 'Activa' }
  if (query.q !== undefined) {
    const texto = buscarTexto(query.q)
    filtro.$or = [{ nombre: texto }, { apellido1: texto }, { apellido2: texto }]
  }
  if (query.competenciaId !== undefined) {
    revisarId(query.competenciaId)
    filtro.competencias = new ObjectId(query.competenciaId)
  }
  if (query.carrera !== undefined) filtro.carrera = buscarTexto(query.carrera, true)
  if (query.disponibilidad !== undefined) filtro.disponibilidad = buscarTexto(query.disponibilidad)
  const resultado = await repositorio.listar(filtro, opciones)
  const items = await Promise.all(resultado.items.map(usuario => consultarPerfil(usuario)))
  return pagina(items, resultado.total, opciones)
}

export async function consultarPublico(id) {
  revisarId(id)
  const usuario = await repositorio.buscarPublicoPorId(id)
  if (!usuario) throw new HttpError(404, 'NO_ENCONTRADO', 'El usuario no existe.', {})
  return consultarPerfil(usuario)
}

export async function existe(id) {
  const usuario = await repositorio.buscarPorId(id, true)
  return usuario !== null
}

export async function consultarPerfil(usuario) {
  return {
    ...usuario,
    descripcionPersonal: usuario.descripcionPersonal ?? null,
    intereses: usuario.intereses ?? [],
    portafolio: usuario.portafolio ?? null,
    competencias: await repositorio.buscarCompetencias(usuario.competencias ?? []),
  }
}

export async function modificarPerfil(datos, usuarioId) {
  const errores = validarPerfil(datos)
  if (Object.keys(errores).length > 0) {
    throw new HttpError(400, 'DATOS_INVALIDOS', 'Revise los datos enviados.', errores)
  }
  const competencias = datos.competencias ?? []
  const existentes = await repositorio.buscarCompetencias(competencias)
  if (existentes.length !== competencias.length) {
    throw new HttpError(400, 'DATOS_INVALIDOS', 'Revise los datos enviados.', {
      competencias: 'Una o más competencias no existen.',
    })
  }

  const actualizado = await repositorio.modificarPerfil(usuarioId, {
    nombre: datos.nombre.trim(),
    apellido1: datos.apellido1.trim(),
    apellido2: datos.apellido2?.trim() || null,
    carrera: datos.carrera.trim(),
    descripcionPersonal: datos.descripcionPersonal?.trim() || null,
    intereses: (datos.intereses ?? []).map(interes => interes.trim()),
    disponibilidad: datos.disponibilidad?.trim() || null,
    portafolio: datos.portafolio?.trim() || null,
    competencias: competencias.map(id => new ObjectId(id)),
  })
  if (!actualizado) {
    throw new HttpError(401, 'NO_AUTENTICADO', 'La cuenta ya no está disponible.', {})
  }
  const usuario = await repositorio.buscarPorId(usuarioId, false)
  return consultarPerfil(usuario)
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
