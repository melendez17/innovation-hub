// middlewares/errores.js
// Respuestas uniformes para rutas inexistentes y para cualquier error.
import { HttpError } from '../utils/HttpError.js'
 
export function rutaNoEncontrada(req, res, next) {
  next(new HttpError(404, 'RUTA_NO_ENCONTRADA',
    `No existe ${req.method} ${req.originalUrl}`))
}
 
// Express reconoce un manejador de errores porque recibe CUATRO parámetros
export function manejarErrores(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.estado).json({
      error: {
        codigo: err.codigo,
        mensaje: err.message,
        detalles: err.detalles,
      },
    })
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: { codigo: 'JSON_INVALIDO', mensaje: 'El cuerpo no es un JSON válido.' },
    })
  }
  console.error(err) // el detalle queda en el servidor, nunca en la respuesta
  res.status(500).json({
    error: { codigo: 'ERROR_INTERNO', mensaje: 'Ocurrió un error inesperado.' },
  })
}
