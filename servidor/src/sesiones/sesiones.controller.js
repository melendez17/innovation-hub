import * as servicio from './sesiones.service.js'

export async function crear(req, res) {
  const sesion = await servicio.crear(req.body)
  res.set('Cache-Control', 'no-store').json(sesion)
}

export function consultarActual(req, res) {
  res.set('Cache-Control', 'no-store').json({
    expiresAt: req.sesion.expiresAt,
    usuario: req.sesion.usuario,
  })
}

export async function cerrarActual(req, res) {
  await servicio.cerrar(req.sesion.tokenHash)
  res.set('Cache-Control', 'no-store').status(204).end()
}
