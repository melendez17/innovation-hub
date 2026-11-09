import * as servicio from './iniciativas.service.js'
 
export async function listar(req, res) {
  const iniciativas = await servicio.listar(req.sesion?.usuario._id, req.query)
  res.json(iniciativas)
}

export async function crear(req, res) {
  const iniciativa = await servicio.crear(req.body ?? {}, req.sesion.usuario._id)
  res.status(201).json(iniciativa)
}

export async function agregarMiembro(req, res){
  const iniciativa = await servicio.agregarMiembro(req.params.id, req.body ?? {})
  res.json(iniciativa)
}

export async function modificar(req, res) {
  const iniciativa = await servicio.modificar(req.params.id, req.body ?? {}, req.sesion.usuario._id)
  res.json(iniciativa)
}

export async function publicar(req, res) {
  const iniciativa = await servicio.publicar(req.params.id, req.sesion.usuario._id)
  res.json(iniciativa)
}

export async function eliminar(req, res) {
  const archivada = await servicio.eliminar(req.params.id, req.sesion.usuario._id)
  if (archivada) {
    return res.json(archivada)
  }
  res.status(204).end()
}

export async function buscar(req, res) {
  const iniciativa = await servicio.buscar(req.params.id, req.sesion?.usuario._id)
  res.json(iniciativa)
}
