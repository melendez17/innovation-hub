import { autenticar } from '../sesiones/sesiones.service.js'

export async function requiereSesion(req, res, next) {
  req.sesion = await autenticar(req.get('authorization'))
  next()
}
