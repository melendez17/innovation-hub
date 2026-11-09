import * as servicio from './proyectos.service.js'

export async function crear(req, res) {
  const proyecto = await servicio.crear(req.params.id, req.body ?? {}, req.sesion.usuario._id)
  res.location(`/api/proyectos/${proyecto._id}`).status(201).json(proyecto)
}

export async function listar(req, res) {
  const proyectos = await servicio.listar(req.sesion?.usuario._id, req.query)
  res.set('Cache-Control', 'no-store').json(proyectos)
}

export async function buscar(req, res) {
  const proyecto = await servicio.buscar(req.params.id, req.sesion?.usuario._id)
  res.set('Cache-Control', 'no-store').json(proyecto)
}
