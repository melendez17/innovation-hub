import * as servicio from './equipo.service.js'

export async function listar(req, res) {
  const equipo = await servicio.listar(req.params.id, req.sesion?.usuario._id)
  res.set('Cache-Control', 'no-store').json(equipo)
}

export async function retirar(req, res) {
  const miembro = await servicio.retirar(req.params.id, req.params.usuarioId, req.body ?? {}, req.sesion.usuario._id)
  res.set('Cache-Control', 'no-store').json(miembro)
}
