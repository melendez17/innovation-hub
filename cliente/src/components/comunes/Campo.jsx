import { useId } from 'react'

export default function Campo({
  nombre,
  etiqueta,
  valor,
  onChange,
  error,
  ayuda,
  tipo = 'text',
  opciones,
  children,
  ...props
}) {
  const id = useId()
  const comunes = {
    id,
    name: nombre,
    value: valor ?? '',
    onChange: (evento) => onChange(evento.target.value),
    className: `${opciones || tipo === 'select' ? 'form-select' : 'form-control'}${error ? ' is-invalid' : ''}`,
    'aria-invalid': error ? true : undefined,
    'aria-describedby':
      [error && `${id}-error`, ayuda && `${id}-ayuda`]
        .filter(Boolean)
        .join(' ') || undefined,
    ...props,
  }
  return (
    <div className="campo">
      <label htmlFor={id} className="form-label">
        {etiqueta}
        {props.required && <span aria-hidden="true"> *</span>}
      </label>
      {opciones || tipo === 'select' ? (
        <select {...comunes}>
          {children}
          {opciones?.map((opcion) => (
            <option
              key={typeof opcion === 'string' ? opcion : opcion.valor}
              value={typeof opcion === 'string' ? opcion : opcion.valor}
            >
              {typeof opcion === 'string' ? opcion : opcion.texto}
            </option>
          ))}
        </select>
      ) : tipo === 'textarea' ? (
        <textarea {...comunes} rows={props.rows || 4} />
      ) : (
        <input {...comunes} type={tipo} />
      )}
      {ayuda && (
        <div className="form-text" id={`${id}-ayuda`}>
          {ayuda}
        </div>
      )}
      {error && (
        <div className="invalid-feedback d-block" id={`${id}-error`}>
          {error}
        </div>
      )}
    </div>
  )
}
