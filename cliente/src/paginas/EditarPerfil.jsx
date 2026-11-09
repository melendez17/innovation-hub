import { useNavigate } from 'react-router-dom'
import { useConsulta } from '../hooks/useConsulta'
import { useFormulario } from '../hooks/useFormulario'
import { useSesion } from '../hooks/useSesion'
import { pedir } from '../api/cliente'
import { validarPerfil } from '../utils/validaciones'
import Pagina from '../components/layout/Pagina'
import Formulario, {
  CampoFormulario as Campo,
} from '../components/comunes/Formulario'
import ListaTextos from '../components/comunes/ListaTextos'
import SelectorCompetencias from '../components/comunes/SelectorCompetencias'
import { Cargando, ErrorConsulta } from '../components/comunes/Estados'
function Edicion({ usuario }) {
  const navegar = useNavigate()
  const { actualizarUsuario } = useSesion()
  const formulario = useFormulario(
    {
      nombre: usuario.nombre,
      apellido1: usuario.apellido1,
      apellido2: usuario.apellido2 || '',
      carrera: usuario.carrera,
      descripcionPersonal: usuario.descripcionPersonal || '',
      intereses: usuario.intereses || [],
      disponibilidad: usuario.disponibilidad || '',
      portafolio: usuario.portafolio || '',
      competencias: (usuario.competencias || []).map((c) => c._id),
    },
    validarPerfil,
    async (datos) => {
      const actualizado = await pedir('/usuarios/me', 'PUT', datos)
      actualizarUsuario(actualizado)
      navegar('/perfil', { state: { mensaje: 'Perfil actualizado.' } })
    },
  )
  return (
    <Formulario formulario={formulario} cancelar="/perfil">
      <div className="row">
        <div className="col-md-6">
          <Campo
            formulario={formulario}
            nombre="nombre"
            etiqueta="Nombre"
            autoComplete="given-name"
            required
          />
        </div>
        <div className="col-md-6">
          <Campo
            formulario={formulario}
            nombre="apellido1"
            etiqueta="Primer apellido"
            required
          />
        </div>
        <div className="col-md-6">
          <Campo
            formulario={formulario}
            nombre="apellido2"
            etiqueta="Segundo apellido"
          />
        </div>
        <div className="col-md-6">
          <Campo
            formulario={formulario}
            nombre="carrera"
            etiqueta="Carrera o área"
            required
          />
        </div>
      </div>
      <Campo
        formulario={formulario}
        nombre="descripcionPersonal"
        etiqueta="Descripción personal"
        tipo="textarea"
      />
      <ListaTextos
        etiqueta="Intereses"
        valores={formulario.datos.intereses}
        onCambiar={(v) => formulario.cambiar('intereses', v)}
        ejemplo="Ej. sostenibilidad"
      />
      <Campo
        formulario={formulario}
        nombre="disponibilidad"
        etiqueta="Disponibilidad"
        ayuda="Por ejemplo: martes y jueves por la tarde."
      />
      <Campo
        formulario={formulario}
        nombre="portafolio"
        etiqueta="Enlace a portafolio"
        tipo="url"
        placeholder="https://…"
      />
      <SelectorCompetencias
        valores={formulario.datos.competencias}
        onCambiar={(v) => formulario.cambiar('competencias', v)}
        error={formulario.errores.competencias}
      />
    </Formulario>
  )
}
export default function EditarPerfil() {
  const resultado = useConsulta('/usuarios/me')
  return (
    <Pagina
      titulo="Editar mi perfil"
      descripcion="Actualiza tus datos, habilidades y disponibilidad. Tu correo y credenciales se conservan."
    >
      {resultado.cargando ? (
        <Cargando />
      ) : resultado.error ? (
        <ErrorConsulta error={resultado.error} recargar={resultado.recargar} />
      ) : (
        resultado.datos && <Edicion usuario={resultado.datos} />
      )}
    </Pagina>
  )
}
