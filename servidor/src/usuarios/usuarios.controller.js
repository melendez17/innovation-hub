import * as servicio from './usuarios.service.js'
 
export async function listar(req, res) {
  const usuarios = await servicio.listar()
  res.json(usuarios)
}

export async function crear(req, res) {
  const usuario = await servicio.crear(req.body ?? {})
  res.status(201).json(usuario)
}