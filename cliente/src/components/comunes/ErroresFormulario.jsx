import { useEffect, useRef } from 'react'

export default function ErroresFormulario({ mensaje, errores }) {
  const referencia = useRef(null)
  const tieneErrores = Object.keys(errores || {}).length > 0
  useEffect(() => {
    if (mensaje || tieneErrores) referencia.current?.focus()
  }, [mensaje, tieneErrores])
  if (!mensaje && !tieneErrores) return null
  return (
    <div
      ref={referencia}
      tabIndex={-1}
      role="alert"
      className="alert alert-danger resumen-errores"
    >
      <p className="mb-0">
        {mensaje || 'Revisa los campos indicados antes de continuar.'}
      </p>
      {tieneErrores && (
        <ul className="mb-0 mt-2">
          {Object.entries(errores).map(([campo, texto]) => (
            <li key={campo}>{texto}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
