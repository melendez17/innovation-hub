function fechaValida(valor) {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false
  const fecha = new Date(`${valor}T00:00:00.000Z`)
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor
}

export function validarProyecto(datos) {
  const errores = {}
  if (datos === null || typeof datos !== 'object' || Array.isArray(datos)) {
    return { cuerpo: 'Envíe un objeto con los datos del proyecto.' }
  }
  for (const campo of ['nombre', 'descripcion', 'objetivo']) {
    if (typeof datos[campo] !== 'string' || datos[campo].trim().length < 2) {
      errores[campo] = 'Escriba al menos dos caracteres.'
    }
  }
  if (!fechaValida(datos.fechaInicio)) errores.fechaInicio = 'Indique una fecha válida YYYY-MM-DD.'
  if (datos.fechaFinEstimada != null && datos.fechaFinEstimada !== '') {
    if (!fechaValida(datos.fechaFinEstimada) || datos.fechaFinEstimada < datos.fechaInicio) {
      errores.fechaFinEstimada = 'La fecha final debe ser válida y no anterior a la inicial.'
    }
  }
  if (datos.tecnologias !== undefined &&
      (!Array.isArray(datos.tecnologias) || datos.tecnologias.some(valor => typeof valor !== 'string' || !valor.trim()))) {
    errores.tecnologias = 'Envíe una lista de tecnologías de texto no vacías.'
  }
  if (datos.repositorioUrl != null && datos.repositorioUrl !== '') {
    try {
      if (typeof datos.repositorioUrl !== 'string') throw new Error()
      const url = new URL(datos.repositorioUrl)
      if (url.origin !== 'https://github.com' || url.username || url.password || url.search || url.hash ||
          !/^\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/.test(url.pathname)) throw new Error()
    } catch {
      errores.repositorioUrl = 'Indique la URL HTTPS de un repositorio de GitHub.'
    }
  }
  return errores
}
