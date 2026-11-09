import { useEffect, useId, useRef, useState } from 'react'
import Campo from './Campo'

export default function Confirmacion({
  abierta,
  titulo,
  descripcion,
  textoConfirmar = 'Confirmar',
  onConfirmar,
  onCerrar,
  pedirTexto = false,
  etiquetaTexto = 'Motivo (opcional)',
  peligrosa = false,
}) {
  const dialogo = useRef(null)
  const id = useId()
  const [texto, setTexto] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    if (abierta && !dialogo.current.open) {
      setTexto('')
      setError('')
      dialogo.current.showModal()
    } else if (!abierta && dialogo.current.open) dialogo.current.close()
  }, [abierta])
  async function confirmar(evento) {
    evento.preventDefault()
    if (ocupado) return
    setOcupado(true)
    setError('')
    try {
      await onConfirmar(texto.trim() || null)
      onCerrar()
    } catch (fallo) {
      setError(fallo.message)
    } finally {
      setOcupado(false)
    }
  }
  return (
    <dialog
      ref={dialogo}
      className="confirmacion"
      aria-labelledby={`${id}-titulo`}
      aria-describedby={`${id}-texto`}
      onCancel={(evento) => {
        evento.preventDefault()
        if (!ocupado) onCerrar()
      }}
    >
      <form onSubmit={confirmar} aria-busy={ocupado}>
        <h2 id={`${id}-titulo`} className="h4">
          {titulo}
        </h2>
        <p id={`${id}-texto`}>{descripcion}</p>
        {error && (
          <p className="alert alert-danger" role="alert">
            {error}
          </p>
        )}
        <fieldset disabled={ocupado}>
          {pedirTexto && (
            <Campo
              nombre="comentario"
              etiqueta={etiquetaTexto}
              tipo="textarea"
              valor={texto}
              onChange={setTexto}
            />
          )}
          <div className="acciones mt-4">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onCerrar}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`btn ${peligrosa ? 'btn-danger' : 'btn-primary'}`}
            >
              {ocupado ? 'Procesando…' : textoConfirmar}
            </button>
          </div>
        </fieldset>
      </form>
    </dialog>
  )
}
