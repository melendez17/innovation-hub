import { ObjectId } from 'mongodb'
import * as repositorio from './iniciativas.repository.js'
import { validarIniciativa } from './iniciativas.validacion.js'
import { HttpError } from '../utils/HttpError.js'
import { revisarId } from "../utils/revisarId.js"

 
export async function listar() {
  return repositorio.listar()
}

export async function crear(datos, propietarioId){
  const errores = validarIniciativa(datos)
  if (Object.keys(errores).length > 0) {
    throw new HttpError(400, 'Datos_INVALIDOS', 'Revise los datos enviados.', errores)
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
    competencias:  datos.competencias.map(id => new ObjectId(id)),
    cantidadIntegrantes: datos.cantidadIntegrantes,
    visibilidad: datos.visibilidad, 
    etiquetas: datos.etiquetas,
    estado: "Borrador",
    propietarioId: new ObjectId(propietarioId),
    miembros: [new ObjectId(propietarioId)],
    fechaCreacion: hoy,
    fechaUltimaModificacion: hoy
  })

  return repositorio.buscarPorID(id)
}

export async function buscar(id){
  revisarId(id)
  const existe = await repositorio.buscarPorID(id)
  if(!existe) {
    throw new HttpError(404, 'NO_ENCONTRADA', 'La iniciativa no existe.')
  }

  return repositorio.buscarPorID(id)
}

export async function agregarMiembro(id, datos){
  revisarId(id)
  revisarId(datos.id)
  const existe = await repositorio.agregarMiembro(id, datos.id)
  if(!existe) {
    throw new HttpError(404, 'NO_ENCONTRADA', 'La iniciativa no existe.')
  }
  return repositorio.buscarPorID(id)
}

export async function eliminar(id, usuarioId){
  revisarId(id)
  const iniciativa = await repositorio.buscarParaEliminar(id)

  if (!iniciativa) {
    throw new HttpError(404, 'NO_ENCONTRADA', 'La iniciativa no existe')
  }

  if (iniciativa.propietarioId.toString() !== usuarioId.toString()) {
    throw new HttpError(403, 'PROHIBIDO', 'Solo el propietario puede eliminar esta iniciativa.', {})
  }

  if (iniciativa.estado === 'Archivada') {
    throw new HttpError(409, 'CONFLICTO', 'La iniciativa ya está archivada.', {})
  }

  const tieneOtrosMiembros = (iniciativa.miembros ?? []).some(
    miembroId => miembroId.toString() !== iniciativa.propietarioId.toString()
  )
  const tieneRelaciones = tieneOtrosMiembros || Boolean(iniciativa.proyectoId) ||
    await repositorio.tieneSolicitudesOProyecto(id)

  if (tieneRelaciones) {
    const archivada = await repositorio.archivar(id, usuarioId)
    if (!archivada) {
      throw new HttpError(409, 'CONFLICTO', 'La iniciativa cambió. Consulte su estado e intente otra vez.', {})
    }
    return repositorio.buscarPorID(id)
  }

  const existia = await repositorio.eliminar(id, usuarioId, iniciativa.miembros)

  if(!existia) {
    throw new HttpError(409, 'CONFLICTO', 'La iniciativa cambió. Consulte su estado e intente otra vez.', {})
  }
  return null
}
