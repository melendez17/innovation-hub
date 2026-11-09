import { useState } from 'react'
import { useConsulta } from '../../hooks/useConsulta'
import { consulta } from '../../api/cliente'
import { nombreCompleto } from '../../utils/formatos'
import Campo from './Campo'
import Paginacion from './Paginacion'
import { Cargando, ErrorConsulta } from './Estados'
export default function SelectorPropietario({ valor, onCambiar }) {
  const [busqueda, setBusqueda] = useState('')
  const [termino, setTermino] = useState('')
  const [pagina, setPagina] = useState(1)
  const usuarios = useConsulta(
    termino
      ? `/usuarios?${consulta({ q: termino, size: 6, page: pagina })}`
      : null,
    true,
  )
  const seleccionado = useConsulta(valor ? `/usuarios/${valor}` : null)
  return (
    <div className="mb-3">
      <Campo
        nombre="buscarPropietario"
        etiqueta="Buscar propietario por nombre"
        valor={busqueda}
        onChange={setBusqueda}
      />
      <button
        type="button"
        className="btn btn-outline-primary btn-sm"
        disabled={!busqueda.trim()}
        onClick={() => {
          setTermino(busqueda.trim())
          setPagina(1)
        }}
      >
        Buscar persona
      </button>
      {seleccionado.datos && (
        <p className="mt-2 mb-1">
          Propietario seleccionado:{' '}
          <strong>{nombreCompleto(seleccionado.datos)}</strong>
        </p>
      )}
      {valor && (
        <button
          className="btn btn-link btn-sm"
          type="button"
          onClick={() => onCambiar('')}
        >
          Quitar propietario seleccionado
        </button>
      )}
      {usuarios.cargando ? (
        <Cargando />
      ) : usuarios.error ? (
        <ErrorConsulta error={usuarios.error} recargar={usuarios.recargar} />
      ) : (
        usuarios.datos && (
          <>
            <Campo
              nombre="propietarioId"
              etiqueta="Propietario"
              valor={valor}
              onChange={onCambiar}
              opciones={[
                { valor: '', texto: 'Cualquier propietario' },
                ...usuarios.datos.items.map((persona) => ({
                  valor: persona._id,
                  texto: nombreCompleto(persona),
                })),
              ]}
            />
            {!usuarios.datos.items.length && (
              <p role="status">No hay personas con ese nombre.</p>
            )}
            <Paginacion datos={usuarios.datos} onCambiar={setPagina} />
          </>
        )
      )}
    </div>
  )
}
