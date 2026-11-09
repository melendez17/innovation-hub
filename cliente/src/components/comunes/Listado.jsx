import { useState } from 'react'
import Campo from './Campo'
import Paginacion from './Paginacion'
import { Cargando, ErrorConsulta, Vacio } from './Estados'

export function Filtros({ valores, aplicar, campos, children }) {
  const [datos, setDatos] = useState(valores)
  const [error, setError] = useState('')
  const cambiar = (nombre, valor) =>
    setDatos((previos) => ({ ...previos, [nombre]: valor }))
  return (
    <form
      className="filtros"
      onSubmit={(evento) => {
        evento.preventDefault()
        if (datos.desde && datos.hasta && datos.desde > datos.hasta) {
          setError('La fecha final no puede ser anterior a la inicial.')
          return
        }
        setError('')
        aplicar(datos)
      }}
    >
      {error && (
        <p className="alert alert-danger" role="alert">
          {error}
        </p>
      )}
      <div className="row g-3">
        {campos.map((campo) => (
          <div className={campo.ancho || 'col-md-4'} key={campo.nombre}>
            <Campo
              {...campo}
              valor={datos[campo.nombre]}
              onChange={(valor) => cambiar(campo.nombre, valor)}
            />
          </div>
        ))}
      </div>
      {children?.(datos, cambiar)}
      <div className="acciones mt-2">
        <button className="btn btn-primary" type="submit">
          Aplicar filtros
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => {
            const vacios = Object.fromEntries(
              Object.keys(valores).map((clave) => [clave, '']),
            )
            setError('')
            setDatos(vacios)
            aplicar(vacios)
          }}
        >
          Limpiar filtros
        </button>
      </div>
    </form>
  )
}
export default function Listado({
  resultado,
  children,
  vacio = 'No encontramos resultados con estos filtros.',
}) {
  if (resultado.cargando) return <Cargando />
  if (resultado.error)
    return (
      <ErrorConsulta error={resultado.error} recargar={resultado.recargar} />
    )
  return (
    <>
      <p className="resultado-total" role="status">
        {resultado.datos?.total || 0} resultados
      </p>
      {resultado.datos?.items.length ? (
        children(resultado.datos.items)
      ) : (
        <Vacio>
          <p>{vacio}</p>
        </Vacio>
      )}
      <Paginacion datos={resultado.datos} onCambiar={resultado.cambiarPagina} />
    </>
  )
}
