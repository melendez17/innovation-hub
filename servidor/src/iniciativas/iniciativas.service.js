import { ObjectId } from 'mongodb'
import * as repositorio from './iniciativas.repository.js'
import * as usuarios from '../usuarios/usuarios.service.js'
import { validarIniciativa } from './iniciativas.validacion.js'
import { HttpError } from '../utils/HttpError.js'

 
export async function listar() {
  return repositorio.listar()
}

export async function crear(datos){
  const errores = validarIniciativa(datos)
  if (Object.keys(errores).length > 0) {
    throw new HttpError(400, 'Datos_INVALIDOS', 'Revise los datos enviados.', errores)
  }

  if (!(await usuarios.existe(datos.propietarioId))) {
    throw new HttpError(400, 'Datos_INVALIDOS', 'Revise los datos enviados.', {propietarioId: 'Este usuario no existe'})
  }

  const hoy = new Date()

  const id = await repositorio.crear({
    titulo: datos.titulo.trim(),
    tipo: datos.tipo,
    resumen: datos.resumen.trim(),
    descripcion: datos.descripcion.trim(),
    problema: datos.problema.trim(),
    beneficiados: datos.beneficiados.trim(),
    categoria: datos.categoria,
    competencias:  datos.competencias,
    cantidadIntegrantes: datos.cantidadIntegrantes,
    visibilidad: datos.visibilidad, 
    etiquetas: datos.etiquetas,
    estado: "Borrador",
    propietarioId: new ObjectId(datos.propietarioId),
    miembros: [new ObjectId(datos.propietarioId)],
    fechaCreacion: hoy,
    fechaUltimaModificacion: hoy
  })

  return repositorio.buscarPorID(id)
}