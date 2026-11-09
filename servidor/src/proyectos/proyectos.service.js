import { ObjectId } from 'mongodb'
import * as repositorio from './proyectos.repository.js'
import * as iniciativas from '../iniciativas/iniciativas.repository.js'
import * as usuarios from '../usuarios/usuarios.repository.js'
import * as equipo from '../equipo/equipo.service.js'
import { validarProyecto } from './proyectos.validacion.js'
import { conTransaccion } from '../config/db.js'
import { revisarId } from '../utils/revisarId.js'
import { HttpError } from '../utils/HttpError.js'
import { leerPaginacion, pagina } from '../utils/paginacion.js'

export async function crear(iniciativaId, datos, usuarioId) {
  revisarId(iniciativaId)
  const errores = validarProyecto(datos)
  if (Object.keys(errores).length > 0) {
    throw new HttpError(400, 'DATOS_INVALIDOS', 'Revise los datos enviados.', errores)
  }
  let id
  try {
    id = await conTransaccion(async session => {
      const iniciativa = await iniciativas.buscarDocumento(iniciativaId, session)
      if (!iniciativa) throw new HttpError(404, 'NO_ENCONTRADA', 'La iniciativa no existe.', {})
      if (iniciativa.propietarioId.toString() !== usuarioId.toString()) {
        throw new HttpError(403, 'PROHIBIDO', 'Solo el propietario puede convertir la iniciativa.', {})
      }
      if (iniciativa.proyectoId || !['Publicada', 'En formación de equipo'].includes(iniciativa.estado)) {
        throw new HttpError(409, 'CONFLICTO', 'La iniciativa no puede convertirse en su estado actual.', {})
      }
      if (!iniciativa.miembros.some(miembro => miembro.toString() !== iniciativa.propietarioId.toString())) {
        throw new HttpError(409, 'CONFLICTO', 'Debe existir un integrante adicional al propietario.', {})
      }
      const fecha = new Date()
      const proyectoId = await repositorio.crear({
        iniciativaId: iniciativa._id,
        propietarioId: iniciativa.propietarioId,
        nombre: datos.nombre.trim(),
        descripcion: datos.descripcion.trim(),
        objetivo: datos.objetivo.trim(),
        tecnologias: (datos.tecnologias ?? []).map(valor => valor.trim()),
        fechaInicio: datos.fechaInicio,
        fechaFinEstimada: datos.fechaFinEstimada || null,
        repositorioUrl: datos.repositorioUrl?.trim() || null,
        estado: 'Planificación',
        fechaCreacion: fecha,
        fechaUltimaModificacion: fecha,
      }, session)
      if (!(await iniciativas.convertirEnProyecto(iniciativaId, usuarioId, proyectoId, fecha, session))) {
        throw new HttpError(409, 'CONFLICTO', 'La iniciativa cambió. Consulte su estado e intente otra vez.', {})
      }
      return proyectoId
    })
  } catch (error) {
    if (error.code === 11000) throw new HttpError(409, 'CONFLICTO', 'La iniciativa ya tiene un proyecto.', {})
    throw error
  }
  return buscar(id, usuarioId)
}

export async function buscar(id, usuarioId) {
  revisarId(id)
  const proyecto = await repositorio.buscarPorId(id)
  if (!proyecto) throw new HttpError(404, 'NO_ENCONTRADO', 'El proyecto no existe.', {})
  const iniciativa = await iniciativas.consultarPorID(proyecto.iniciativaId, usuarioId)
  if (!iniciativa) throw new HttpError(404, 'NO_ENCONTRADO', 'El proyecto no existe o no tiene acceso.', {})
  const miembros = await equipo.listar(proyecto.iniciativaId, usuarioId)
  const propietario = await usuarios.buscarPorId(proyecto.propietarioId, false)
  return {
    ...proyecto,
    iniciativa: { _id: iniciativa._id, titulo: iniciativa.titulo, tipo: iniciativa.tipo, categoria: iniciativa.categoria, visibilidad: iniciativa.visibilidad },
    propietario: propietario ? { _id: propietario._id, nombre: propietario.nombre, apellido1: propietario.apellido1, apellido2: propietario.apellido2 ?? null, carrera: propietario.carrera } : null,
    miembros,
  }
}

export async function listar(usuarioId, query = {}) {
  const opciones = leerPaginacion(query, ['ambito'], ['fechaCreacion'], '-fechaCreacion')
  const ambito = query.ambito ?? 'catalogo'
  if (!['catalogo', 'propias', 'equipo'].includes(ambito)) {
    throw new HttpError(400, 'DATOS_INVALIDOS', 'El ámbito no es válido.', {})
  }
  if (ambito !== 'catalogo' && !usuarioId) throw new HttpError(401, 'NO_AUTENTICADO', 'Debe iniciar sesión.', {})
  let filtro
  if (ambito === 'propias') {
    filtro = { propietarioId: new ObjectId(usuarioId) }
  } else if (ambito === 'equipo') {
    filtro = { 'iniciativa.miembros': new ObjectId(usuarioId) }
  } else {
    const permisos = [{ 'iniciativa.visibilidad': 'Pública' }]
    if (usuarioId) {
      permisos.push({ 'iniciativa.visibilidad': 'Institucional' }, {
        'iniciativa.visibilidad': 'Restringida',
        $or: [{ 'iniciativa.propietarioId': new ObjectId(usuarioId) }, { 'iniciativa.miembros': new ObjectId(usuarioId) }],
      })
    }
    filtro = { $or: permisos }
  }
  const resultado = await repositorio.listar(filtro, opciones)
  const items = await Promise.all(resultado.items.map(item => buscar(item._id, usuarioId)))
  return pagina(items, resultado.total, opciones)
}
