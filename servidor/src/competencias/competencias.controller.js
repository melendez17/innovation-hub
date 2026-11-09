import * as servicio from './competencias.service.js'
 
export async function listar(req, res) {
  const competencias = await servicio.listar()
  res.json(competencias)
}
