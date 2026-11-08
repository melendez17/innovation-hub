import * as servicio from './usuarios.service.js'
 
export async function listar(req, res) {
  const usuarios = await servicio.listar()
  res.json(usuarios)
}