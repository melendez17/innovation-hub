import * as servicio from './iniciativas.repository.js'
 
export async function listar(req, res) {
  const iniciativas = await servicio.listar()
  res.json(iniciativas)
}