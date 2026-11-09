import * as servicio from './usuarios.service.js'
 
export async function listar(req, res) {
  const usuarios = await servicio.listar()
  res.json(usuarios)
}

export function consultarPropio(req, res) {
  // El middleware ya consultó al usuario de la sesión sin traer credenciales.
  const usuario = req.sesion.usuario
  res.set('Cache-Control', 'no-store').json({
    ...usuario,
    descripcionPersonal: usuario.descripcionPersonal ?? null,
    intereses: usuario.intereses ?? [],
    portafolio: usuario.portafolio ?? null,
    competencias: usuario.competencias ?? [],
  })
}

export async function crear(req, res) {
  const usuario = await servicio.crear(req.body ?? {})
  res.status(201).json(usuario)
}
