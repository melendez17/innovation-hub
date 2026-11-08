import * as servicio from './iniciativas.repository.js'
 
export async function listar(req, res) {
  const iniciativas = await servicio.listar()
  res.json(iniciativas)
}

export async function crear(req, res) {
  const iniciativa = await servicio.crear(req.body ?? {})
  res.status(201).jason(iniciativa)
}