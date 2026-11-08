import * as servicio from './iniciativas.service.js'
 
export async function listar(req, res) {
  const iniciativas = await servicio.listar()
  res.json(iniciativas)
}

export async function crear(req, res) {
  const iniciativa = await servicio.crear(req.body ?? {})
  res.status(201).json(iniciativa)
}

export async function agregarMiembro(req, res){
  const iniciativa = await servicio.agregarMiembro(req.params.id, req.body ?? {})
  res.json(iniciativa)
}

export async function eliminar(req, res) {
  await servicio.eliminar(req.params.id)
  res.status(204).end()
}