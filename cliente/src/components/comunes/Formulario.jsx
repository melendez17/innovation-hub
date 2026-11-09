import { Link } from 'react-router-dom'
import Campo from './Campo'
import ErroresFormulario from './ErroresFormulario'

export function CampoFormulario({ formulario, nombre, ...props }) {
  return (
    <Campo
      {...props}
      nombre={nombre}
      valor={formulario.datos[nombre]}
      error={formulario.errores[nombre]}
      onChange={(valor) => formulario.cambiar(nombre, valor)}
    />
  )
}
export default function Formulario({
  formulario,
  texto = 'Guardar cambios',
  cancelar,
  children,
}) {
  return (
    <form
      noValidate
      onSubmit={formulario.enviar}
      className="formulario"
      aria-busy={formulario.ocupado}
    >
      <p className="ayuda-obligatorios">Los campos con * son obligatorios.</p>
      <ErroresFormulario
        mensaje={formulario.mensaje}
        errores={Object.fromEntries(
          Object.entries(formulario.errores).filter(([, valor]) => valor),
        )}
      />
      <fieldset disabled={formulario.ocupado}>
        {children}
        <div className="acciones mt-4">
          <button className="btn btn-primary" type="submit">
            {formulario.ocupado ? 'Guardando…' : texto}
          </button>
          {cancelar && (
            <Link className="btn btn-outline-secondary" to={cancelar}>
              Cancelar
            </Link>
          )}
        </div>
      </fieldset>
    </form>
  )
}
