import * as servicio from './solicitudes.service.js'

export async function crear(req, res) {
  const solicitud = await servicio.crear(req.params.id, req.body ?? {}, req.sesion.usuario._id)
  res.status(201).json(solicitud)
}

export async function listarPropias(req, res) {
  const solicitudes = await servicio.listarPropias(req.sesion.usuario._id)
  res.set('Cache-Control', 'no-store').json(solicitudes)
}

export async function listarRecibidas(req, res) {
  const solicitudes = await servicio.listarRecibidas(req.params.id, req.sesion.usuario._id)
  res.set('Cache-Control', 'no-store').json(solicitudes)
}

export async function buscar(req, res) {
  const solicitud = await servicio.buscar(req.params.id, req.sesion.usuario._id)
  res.set('Cache-Control', 'no-store').json(solicitud)
}

export async function modificar(req, res) {
  const solicitud = await servicio.modificar(req.params.id, req.body ?? {}, req.sesion.usuario._id)
  res.set('Cache-Control', 'no-store').json(solicitud)
}

export async function cancelar(req, res) {
  const solicitud = await servicio.cancelar(req.params.id, req.sesion.usuario._id)
  res.set('Cache-Control', 'no-store').json(solicitud)
}
