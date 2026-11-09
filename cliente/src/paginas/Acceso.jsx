import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useSesion } from '../hooks/useSesion'
import { pedir } from '../api/cliente'
import { useFormulario } from '../hooks/useFormulario'
import { validarLogin, validarRegistro } from '../utils/validaciones'
import { TIPOS_MIEMBRO } from '../datos/catalogos'
import Pagina from '../components/layout/Pagina'
import Formulario, {
  CampoFormulario as Campo,
} from '../components/comunes/Formulario'

export default function Acceso({ registro = false }) {
  const sesion = useSesion()
  const ubicacion = useLocation()
  const navegar = useNavigate()
  const formulario = useFormulario(
    {
      nombre: '',
      apellido1: '',
      apellido2: '',
      carrera: '',
      tipo: '',
      email: ubicacion.state?.email || '',
      password: '',
      confirmacionPassword: '',
      aceptaTerminos: false,
    },
    registro ? validarRegistro : validarLogin,
    async (datos) => {
      if (registro) {
        await pedir('/usuarios', 'POST', datos)
        navegar('/ingresar', {
          replace: true,
          state: {
            email: datos.email,
            mensaje: 'Cuenta registrada. Ya puedes iniciar sesión.',
          },
        })
      } else {
        await sesion.iniciarSesion({
          email: datos.email,
          password: datos.password,
        })
        const desde = ubicacion.state?.desde
        navegar(
          desde?.startsWith('/') && !desde.startsWith('//')
            ? desde
            : '/catalogo',
          { replace: true },
        )
      }
    },
  )
  if (sesion.usuario) return <Navigate to="/catalogo" replace />
  return (
    <div className="formulario-estrecho">
      <Pagina
        titulo={registro ? 'Crear una cuenta' : 'Iniciar sesión'}
        descripcion={
          registro
            ? 'Comparte tus habilidades y participa en iniciativas.'
            : 'Ingresa para gestionar tus iniciativas y participar en equipos.'
        }
      >
        <Formulario
          formulario={formulario}
          texto={registro ? 'Registrarme' : 'Ingresar'}
        >
          {registro && (
            <>
              <Campo
                formulario={formulario}
                nombre="nombre"
                etiqueta="Nombre"
                autoComplete="given-name"
                required
              />
              <Campo
                formulario={formulario}
                nombre="apellido1"
                etiqueta="Primer apellido"
                autoComplete="family-name"
                required
              />
              <Campo
                formulario={formulario}
                nombre="apellido2"
                etiqueta="Segundo apellido"
              />
              <Campo
                formulario={formulario}
                nombre="carrera"
                etiqueta="Carrera o área"
                required
              />
              <Campo
                formulario={formulario}
                nombre="tipo"
                etiqueta="Tipo de miembro"
                opciones={[
                  { valor: '', texto: 'Seleccionar…' },
                  ...TIPOS_MIEMBRO,
                ]}
                required
              />
            </>
          )}
          <Campo
            formulario={formulario}
            nombre="email"
            etiqueta="Correo electrónico"
            tipo="email"
            autoComplete="email"
            required
          />
          <Campo
            formulario={formulario}
            nombre="password"
            etiqueta="Contraseña"
            tipo="password"
            autoComplete={registro ? 'new-password' : 'current-password'}
            ayuda={registro ? 'Entre 8 y 128 caracteres.' : undefined}
            required
          />
          {registro && (
            <>
              <Campo
                formulario={formulario}
                nombre="confirmacionPassword"
                etiqueta="Confirmar contraseña"
                tipo="password"
                autoComplete="new-password"
                required
              />
              <details className="mb-3">
                <summary>Términos de utilización</summary>
                <p className="mt-2">
                  Utiliza la plataforma para colaborar con respeto. Registra
                  información veraz y comparte únicamente contenido que tengas
                  permiso de publicar. Respeta la privacidad y los acuerdos de
                  cada equipo.
                </p>
              </details>
              <label className="d-flex gap-2 align-items-start">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={formulario.datos.aceptaTerminos}
                  onChange={(evento) =>
                    formulario.cambiar('aceptaTerminos', evento.target.checked)
                  }
                  required
                  aria-invalid={Boolean(formulario.errores.aceptaTerminos)}
                />
                Acepto los términos de utilización *
              </label>
            </>
          )}
        </Formulario>
        <p className="mt-4">
          {registro ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
          <Link to={registro ? '/ingresar' : '/registro'}>
            {registro ? 'Inicia sesión' : 'Regístrate'}
          </Link>
        </p>
      </Pagina>
    </div>
  )
}
