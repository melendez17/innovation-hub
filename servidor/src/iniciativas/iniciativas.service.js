import { ObjectId } from 'mongodb'
import * as repositorio from './iniciativas.repository.js'
import { validarIniciativa, TIPOS, CATEGORIAS, ESTADOS, VISIBILIDADES } from './iniciativas.validacion.js'
import { HttpError } from '../utils/HttpError.js'
import { revisarId } from "../utils/revisarId.js"
import { leerPaginacion, pagina, buscarTexto } from '../utils/paginacion.js'

 
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

export async function listar(usuarioId, query = {}) {
  const opciones = leerPaginacion(query,
    ['ambito', 'tipo', 'categoria', 'competenciaId', 'estado', 'propietarioId', 'visibilidad', 'conEspacios', 'q'],
    ['titulo', 'fechaCreacion'], '-fechaCreacion')
  const ambito = query.ambito ?? 'catalogo'
  if (!['catalogo', 'propias', 'equipo'].includes(ambito)) {
    throw new HttpError(400, 'DATOS_INVALIDOS', 'El ámbito no es válido.', {})
  }
  if (ambito !== 'catalogo' && !usuarioId) {
    throw new HttpError(401, 'NO_AUTENTICADO', 'Debe iniciar sesión para consultar ese ámbito.', {})
  }
  const condiciones = []
  const usuarioObjectId = usuarioId ? new ObjectId(usuarioId) : null
  if (ambito === 'catalogo') {
    condiciones.push({
      estado: { $nin: ['Borrador', 'Archivada'] },
      visibilidad: { $in: usuarioId ? ['Pública', 'Institucional', 'Restringida'] : ['Pública'] },
    })
  } else if (ambito === 'propias') {
    condiciones.push({ propietarioId: usuarioObjectId })
  } else {
    condiciones.push({ miembros: usuarioObjectId }, { $or: [{ estado: { $ne: 'Borrador' } }, { propietarioId: usuarioObjectId }] })
  }

  for (const [campo, catalogo] of [['tipo', TIPOS], ['categoria', CATEGORIAS], ['estado', ESTADOS], ['visibilidad', VISIBILIDADES]]) {
    if (query[campo] === undefined) continue
    if (!catalogo.includes(query[campo])) {
      throw new HttpError(400, 'DATOS_INVALIDOS', `El valor de ${campo} no es válido.`, {})
    }
    // Permite consultar las mayúsculas antiguas sin modificar los datos existentes.
    condiciones.push({ [campo]: campo === 'categoria' ?
      (query[campo] === 'Otro' ? /^Otros?$/i : buscarTexto(query[campo], true)) : query[campo] })
  }
  for (const [parametro, campo] of [['competenciaId', 'competencias'], ['propietarioId', 'propietarioId']]) {
    if (query[parametro] === undefined) continue
    revisarId(query[parametro])
    condiciones.push({ [campo]: new ObjectId(query[parametro]) })
  }

  const accesoCompleto = usuarioObjectId ? { $or: [
    { visibilidad: { $ne: 'Restringida' } }, { propietarioId: usuarioObjectId }, { miembros: usuarioObjectId },
  ] } : { visibilidad: { $ne: 'Restringida' } }
  // No permitir deducir campos ocultos de una restringida mediante filtros.
  if (query.estado !== undefined || query.propietarioId !== undefined || query.conEspacios !== undefined) {
    condiciones.push(accesoCompleto)
  }
  if (query.conEspacios !== undefined) {
    if (!['true', 'false'].includes(query.conEspacios)) {
      throw new HttpError(400, 'DATOS_INVALIDOS', 'conEspacios debe ser true o false.', {})
    }
    const expresion = { $gt: ['$cantidadIntegrantes', { $size: { $ifNull: ['$miembros', []] } }] }
    condiciones.push({ $expr: query.conEspacios === 'true' ? expresion : { $not: [expresion] } })
  }
  if (query.q !== undefined) {
    const texto = buscarTexto(query.q)
    condiciones.push({ $or: [
      { titulo: texto }, { resumen: texto }, { $and: [accesoCompleto, { etiquetas: texto }] },
    ] })
  }
  const resultado = await repositorio.listar({ $and: condiciones }, opciones)
  return pagina(resultado.items.map(iniciativa => aplicarVisibilidad(iniciativa, usuarioId)), resultado.total, opciones)
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
