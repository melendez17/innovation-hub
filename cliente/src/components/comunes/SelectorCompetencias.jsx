import { useConsulta } from '../../hooks/useConsulta'
import Campo from './Campo'
import { Cargando, ErrorConsulta } from './Estados'

export default function SelectorCompetencias({ valores, onCambiar, error }) {
  const catalogo = useConsulta('/competencias')
  if (catalogo.cargando) return <Cargando texto="Cargando competencias…" />
  if (catalogo.error)
    return <ErrorConsulta error={catalogo.error} recargar={catalogo.recargar} />
  const opciones = catalogo.datos || []
  return (
    <div>
      <Campo
        nombre="competencias"
        etiqueta="Competencias"
        tipo="select"
        valor=""
        onChange={(id) => {
          if (id && !valores.includes(id)) onCambiar([...valores, id])
        }}
        error={error}
        ayuda="Selecciona las competencias una a una. Puedes quitarlas de la lista."
      >
        <option value="">
          {opciones.length
            ? 'Seleccionar competencia…'
            : 'No hay competencias en el catálogo'}
        </option>
        {opciones
          .filter((item) => !valores.includes(item._id))
          .map((item) => (
            <option key={item._id} value={item._id}>
              {item.nombre}
            </option>
          ))}
      </Campo>
      <ul className="lista-etiquetas">
        {valores.map((id) => (
          <li key={id}>
            <span>
              {opciones.find((item) => item._id === id)?.nombre ||
                'Competencia seleccionada'}
            </span>
            <button
              type="button"
              aria-label={`Quitar ${opciones.find((item) => item._id === id)?.nombre || 'competencia'}`}
              onClick={() => onCambiar(valores.filter((valor) => valor !== id))}
            >
              Quitar
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
