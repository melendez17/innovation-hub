import * as servicio from './solicitudes.service.js'

export async function crear(req, res) {
  const solicitud = await servicio.crear(req.params.id, req.body ?? {}, req.sesion.usuario._id)
  res.status(201).json(solicitud)
}
