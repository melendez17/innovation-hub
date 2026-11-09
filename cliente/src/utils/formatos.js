export function nombreCompleto(usuario) {
  return [usuario?.nombre, usuario?.apellido1, usuario?.apellido2]
    .filter(Boolean)
    .join(' ')
}

export function fecha(valor) {
  if (!valor) return 'No registrada'
  const objeto = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(valor) ? `${valor}T12:00:00Z` : valor,
  )
  if (Number.isNaN(objeto.getTime())) return 'No registrada'
  return new Intl.DateTimeFormat('es', {
    dateStyle: 'medium',
    timeZone: 'America/Guatemala',
  }).format(objeto)
}

export function hoy() {
  const partes = new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'America/Guatemala',
  }).formatToParts(new Date())
  const valor = (tipo) => partes.find((parte) => parte.type === tipo).value
  return `${valor('year')}-${valor('month')}-${valor('day')}`
}
