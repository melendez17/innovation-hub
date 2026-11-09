import * as servicio from './usuarios.service.js'
 
export async function listar(req, res) {
  const usuarios = await servicio.listar(req.query)
  res.json(usuarios)
}

export async function consultarPublico(req, res) {
  const usuario = await servicio.consultarPublico(req.params.id)
  res.set('Cache-Control', 'no-store').json(usuario)
}

export async function consultarPropio(req, res) {
  const usuario = await servicio.consultarPerfil(req.sesion.usuario)
  res.set('Cache-Control', 'no-store').json(usuario)
}

export async function modificarPropio(req, res) {
  const usuario = await servicio.modificarPerfil(req.body ?? {}, req.sesion.usuario._id)
  res.set('Cache-Control', 'no-store').json(usuario)
}

export async function crear(req, res) {
  const usuario = await servicio.crear(req.body ?? {})
  res.status(201).json(usuario)
}
