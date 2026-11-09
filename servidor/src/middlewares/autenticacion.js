import { autenticar } from '../sesiones/sesiones.service.js'

export async function requiereSesion(req, res, next) {
  req.sesion = await autenticar(req.get('authorization'))
  next()
}

// Las consultas públicas no exigen token. Si se presenta uno, debe ser válido.
export async function sesionOpcional(req, res, next) {
  if (req.get('authorization') !== undefined) {
    req.sesion = await autenticar(req.get('authorization'))
  }
  next()
}
