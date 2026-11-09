export default function Paginacion({ datos, onCambiar }) {
  if (!datos || (datos.totalPages <= 1 && datos.page === 1)) return null
  if (datos.page > datos.totalPages)
    return (
      <button
        type="button"
        className="btn btn-outline-primary"
        onClick={() => onCambiar(1)}
      >
        Volver a la primera página
      </button>
    )
  return (
    <nav className="paginacion" aria-label="Páginas de resultados">
      <button
        className="btn btn-outline-primary"
        type="button"
        disabled={datos.page <= 1}
        onClick={() => onCambiar(datos.page - 1)}
      >
        Anterior
      </button>
      <span aria-live="polite">
        Página {datos.page} de {datos.totalPages}
      </span>
      <button
        className="btn btn-outline-primary"
        type="button"
        disabled={datos.page >= datos.totalPages}
        onClick={() => onCambiar(datos.page + 1)}
      >
        Siguiente
      </button>
    </nav>
  )
}
