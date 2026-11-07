// utils/HttpError.js
// Un error que ya sabe con qué código HTTP debe responderse.
export class HttpError extends Error {
  constructor(estado, codigo, mensaje, detalles) {
    super(mensaje)
    this.estado = estado      // 400, 404, 409…
    this.codigo = codigo      // 'DATOS_INVALIDOS', 'NO_ENCONTRADO'…
    this.detalles = detalles  // opcional: un mensaje por campo
  }
}
