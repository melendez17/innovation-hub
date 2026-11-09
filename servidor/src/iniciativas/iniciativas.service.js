import { ObjectId } from 'mongodb'
import * as repositorio from './iniciativas.repository.js'
import { validarIniciativa } from './iniciativas.validacion.js'
import { HttpError } from '../utils/HttpError.js'
import { revisarId } from "../utils/revisarId.js"

 
function aplicarVisibilidad(iniciativa, usuarioId) {
  const esPropietario = usuarioId && iniciativa.propietarioId.toString() === usuarioId.toString()
  const esMiembro = usuarioId && iniciativa.miembros.some(
    miembro => miembro._id.toString() === usuarioId.toString()
  )
  if (iniciativa.visibilidad === 'Restringida' && !esPropietario && !esMiembro) {
    // Lista explícita: no enviar descripción, problema ni datos del equipo.
    return {
      _id: iniciativa._id,
      titulo: iniciativa.titulo,
      tipo: iniciativa.tipo,
      resumen: iniciativa.resumen,
      categoria: iniciativa.categoria,
      competencias: iniciativa.competencias,
      visibilidad: iniciativa.visibilidad,
      accesoCompleto: false,
    }
  }
  return { ...iniciativa, accesoCompleto: true }
}

export async function listar(usuarioId) {
  const iniciativas = await repositorio.listar(usuarioId)
  return iniciativas.map(iniciativa => aplicarVisibilidad(iniciativa, usuarioId))
}

function datosEditables(datos) {
  // Solo estos campos pueden escribirse; no copiar directamente todo el cuerpo.
  return {
    titulo: datos.titulo.trim(),
    tipo: datos.tipo,
    resumen: datos.resumen.trim(),
    descripcion: datos.descripcion.trim(),
    problema: datos.problema?.trim() || null,
    beneficiados: datos.beneficiados?.trim() || null,
    categoria: datos.categoria,
    competencias: (datos.competencias ?? []).map(id => new ObjectId(id)),
    cantidadIntegrantes: datos.cantidadIntegrantes,
    visibilidad: datos.visibilidad,
    etiquetas: (datos.etiquetas ?? []).map(etiqueta => etiqueta.trim()),
  }
}

async function validarDatos(datos) {
  const errores = validarIniciativa(datos)
  if (Object.keys(errores).length > 0) {
    throw new HttpError(400, 'DATOS_INVALIDOS', 'Revise los datos enviados.', errores)
  }
  if (!(await repositorio.existenCompetencias(datos.competencias ?? []))) {
    throw new HttpError(400, 'DATOS_INVALIDOS', 'Revise los datos enviados.', {
      competencias: 'Una o más competencias no existen.',
    })
  }
}

export async function crear(datos, propietarioId){
  await validarDatos(datos)

  const hoy = new Date()

  const id = await repositorio.crear({
    ...datosEditables(datos),
    estado: "Borrador",
    propietarioId: new ObjectId(propietarioId),
    miembros: [new ObjectId(propietarioId)],
    fechaCreacion: hoy,
    fechaPublicacion: null,
    fechaUltimaModificacion: hoy
  })

  return repositorio.buscarPorID(id)
}

export async function buscar(id, usuarioId){
  revisarId(id)
  const iniciativa = await repositorio.consultarPorID(id, usuarioId)
  if(!iniciativa) {
    throw new HttpError(404, 'NO_ENCONTRADA', 'La iniciativa no existe o no tiene acceso.')
  }

  return aplicarVisibilidad(iniciativa, usuarioId)
}

export async function modificar(id, datos, usuarioId) {
  revisarId(id)
  const iniciativa = await repositorio.buscarDocumento(id)
  if (!iniciativa) {
    throw new HttpError(404, 'NO_ENCONTRADA', 'La iniciativa no existe.', {})
  }
  if (iniciativa.propietarioId.toString() !== usuarioId.toString()) {
    throw new HttpError(403, 'PROHIBIDO', 'Solo el propietario puede modificar esta iniciativa.', {})
  }
  if (iniciativa.estado === 'Archivada') {
    throw new HttpError(409, 'CONFLICTO', 'No se puede modificar una iniciativa archivada.', {})
  }

  await validarDatos(datos)
  if (datos.cantidadIntegrantes < (iniciativa.miembros ?? []).length) {
    throw new HttpError(409, 'CONFLICTO', 'La cantidad de integrantes no puede ser menor que el equipo actual.', {})
  }
  const modificada = await repositorio.modificar(id, usuarioId, datosEditables(datos), iniciativa.miembros)
  if (!modificada) {
    throw new HttpError(409, 'CONFLICTO', 'La iniciativa cambió. Consulte su estado e intente otra vez.', {})
  }
  return repositorio.buscarPorID(id)
}

export async function publicar(id, usuarioId) {
  revisarId(id)
  const iniciativa = await repositorio.buscarDocumento(id)
  if (!iniciativa) {
    throw new HttpError(404, 'NO_ENCONTRADA', 'La iniciativa no existe.', {})
  }
  if (iniciativa.propietarioId.toString() !== usuarioId.toString()) {
    throw new HttpError(403, 'PROHIBIDO', 'Solo el propietario puede publicar esta iniciativa.', {})
  }
  if (iniciativa.estado !== 'Borrador') {
    throw new HttpError(409, 'CONFLICTO', 'Solo se puede publicar una iniciativa en borrador.', {})
  }
  await validarDatos({
    ...iniciativa,
    competencias: (iniciativa.competencias ?? []).map(id => id.toString()),
  })
  const publicada = await repositorio.publicar(id, usuarioId)
  if (!publicada) {
    throw new HttpError(409, 'CONFLICTO', 'La iniciativa cambió. Consulte su estado e intente otra vez.', {})
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
  const iniciativa = await repositorio.buscarDocumento(id)

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
    await repositorio.tieneInformacionRelacionada(id, iniciativa.propietarioId)

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
