import { HttpError } from './HttpError.js'

export function leerPaginacion(query, filtrosPermitidos, ordenesPermitidos, ordenPredeterminado) {
  const permitidos = ['page', 'size', 'sort', ...filtrosPermitidos]
  for (const campo of Object.keys(query)) {
    if (!permitidos.includes(campo) || typeof query[campo] !== 'string' || !query[campo].trim()) {
      throw new HttpError(400, 'DATOS_INVALIDOS', `El parámetro ${campo} no es válido.`, {})
    }
  }
  const page = query.page === undefined ? 1 : Number(query.page)
  const size = query.size === undefined ? 12 : Number(query.size)
  if ((query.page !== undefined && !/^\d+$/.test(query.page)) ||
      (query.size !== undefined && !/^\d+$/.test(query.size)) ||
      !Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(size) || size < 1 || size > 100 ||
      !Number.isSafeInteger((page - 1) * size)) {
    throw new HttpError(400, 'DATOS_INVALIDOS', 'page debe ser positivo y size debe estar entre 1 y 100.', {})
  }
  const sort = query.sort ?? ordenPredeterminado
  const campo = sort.startsWith('-') ? sort.slice(1) : sort
  if (!ordenesPermitidos.includes(campo)) {
    throw new HttpError(400, 'DATOS_INVALIDOS', 'El orden solicitado no es válido.', {})
  }
  return { page, size, salto: (page - 1) * size, orden: { [campo]: sort.startsWith('-') ? -1 : 1, _id: 1 } }
}

export function pagina(items, total, opciones) {
  return { items, page: opciones.page, size: opciones.size, total, totalPages: Math.ceil(total / opciones.size) }
}

// Buscar texto literal, sin interpretar caracteres especiales como expresiones regulares.
export function buscarTexto(texto, exacto = false) {
  if (texto.trim().length > 200) {
    throw new HttpError(400, 'DATOS_INVALIDOS', 'El texto de búsqueda es demasiado largo.', {})
  }
  const literal = texto.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(exacto ? `^${literal}$` : literal, 'i')
}
