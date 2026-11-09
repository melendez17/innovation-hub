import { useId, useState } from 'react'

export default function ListaTextos({ etiqueta, valores, onCambiar, ejemplo }) {
  const id = useId()
  const [texto, setTexto] = useState('')
  const [error, setError] = useState('')
  function agregar() {
    const valor = texto.trim()
    if (!valor) {
      setError('Escribe un valor antes de agregarlo.')
      return
    }
    if (valores.some((item) => item.toLowerCase() === valor.toLowerCase())) {
      setError('Ese valor ya está en la lista.')
      return
    }
    onCambiar([...valores, valor])
    setTexto('')
    setError('')
  }
  return (
    <div className="campo">
      <label className="form-label" htmlFor={id}>
        {etiqueta}
      </label>
      <div className="input-group">
        <input
          id={id}
          className="form-control"
          value={texto}
          placeholder={ejemplo}
          onChange={(evento) => {
            setTexto(evento.target.value)
            setError('')
          }}
          onKeyDown={(evento) => {
            if (evento.key === 'Enter') {
              evento.preventDefault()
              agregar()
            }
          }}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={agregar}
        >
          Agregar
        </button>
      </div>
      {error && (
        <div id={`${id}-error`} role="alert" className="text-danger small mt-1">
          {error}
        </div>
      )}
      <ul className="lista-etiquetas mt-2">
        {valores.map((valor) => (
          <li key={valor}>
            <span>{valor}</span>
            <button
              type="button"
              aria-label={`Quitar ${valor}`}
              onClick={() =>
                onCambiar(valores.filter((item) => item !== valor))
              }
            >
              Quitar
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
