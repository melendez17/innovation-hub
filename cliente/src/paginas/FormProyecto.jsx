import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSesion } from '../hooks/useSesion'
import { useConsulta } from '../hooks/useConsulta'
import { useFormulario } from '../hooks/useFormulario'
import { pedir } from '../api/cliente'
import { hoy } from '../utils/formatos'
import { validarProyecto } from '../utils/validaciones'
import Pagina from '../components/layout/Pagina'
import Formulario, {
  CampoFormulario as Campo,
} from '../components/comunes/Formulario'
import ListaTextos from '../components/comunes/ListaTextos'
import Confirmacion from '../components/comunes/Confirmacion'
import { Cargando, ErrorConsulta } from '../components/comunes/Estados'
function Conversion({ iniciativa }) {
  const navegar = useNavigate()
  const [confirmar, setConfirmar] = useState(false)
  const formulario = useFormulario(
    {
      nombre: iniciativa.titulo,
      descripcion: iniciativa.descripcion,
      objetivo: '',
      tecnologias: [],
      fechaInicio: hoy(),
      fechaFinEstimada: '',
      repositorioUrl: '',
    },
    validarProyecto,
    async () => setConfirmar(true),
  )
  return (
    <>
      <Formulario
        formulario={formulario}
        texto="Revisar conversión"
        cancelar={`/iniciativa/${iniciativa._id}`}
      >
        <p>
          Iniciativa de origen: <strong>{iniciativa.titulo}</strong>
        </p>
        <Campo
          formulario={formulario}
          nombre="nombre"
          etiqueta="Nombre del proyecto"
          required
        />
        <Campo
          formulario={formulario}
          nombre="descripcion"
          etiqueta="Descripción"
          tipo="textarea"
          required
        />
        <Campo
          formulario={formulario}
          nombre="objetivo"
          etiqueta="Objetivo"
          tipo="textarea"
          required
        />
        <ListaTextos
          etiqueta="Tecnologías"
          ejemplo="Ej. React"
          valores={formulario.datos.tecnologias}
          onCambiar={(v) => formulario.cambiar('tecnologias', v)}
        />
        <div className="row mt-4">
          <div className="col-md-6">
            <Campo
              formulario={formulario}
              nombre="fechaInicio"
              etiqueta="Fecha de inicio"
              tipo="date"
              required
            />
          </div>
          <div className="col-md-6">
            <Campo
              formulario={formulario}
              nombre="fechaFinEstimada"
              etiqueta="Fecha estimada de finalización"
              tipo="date"
              min={formulario.datos.fechaInicio}
            />
          </div>
        </div>
        <Campo
          formulario={formulario}
          nombre="repositorioUrl"
          etiqueta="Repositorio de GitHub"
          tipo="url"
          placeholder="https://github.com/propietario/repositorio"
          ayuda="Opcional. La información se consultará públicamente desde GitHub."
        />
      </Formulario>
      <Confirmacion
        abierta={confirmar}
        titulo="Convertir iniciativa en proyecto"
        descripcion="Se creará el proyecto y la iniciativa quedará como Convertida en proyecto. Se conservarán la iniciativa, su visibilidad y el equipo. Esta conversión se realiza una sola vez."
        textoConfirmar="Crear proyecto"
        onCerrar={() => setConfirmar(false)}
        onConfirmar={async () => {
          const proyecto = await pedir(
            `/iniciativas/${iniciativa._id}/proyecto`,
            'POST',
            formulario.datos,
          )
          navegar(`/proyectos/${proyecto._id}`, {
            state: { mensaje: 'Proyecto creado a partir de la iniciativa.' },
          })
        }}
      />
    </>
  )
}
export default function FormProyecto() {
  const { id } = useParams()
  const { usuario } = useSesion()
  const resultado = useConsulta(`/iniciativas/${id}`)
  const iniciativa = resultado.datos
  const permitida =
    iniciativa?.propietarioId === usuario._id &&
    ['Publicada', 'En formación de equipo'].includes(iniciativa.estado) &&
    iniciativa.miembros.length > 1
  return (
    <Pagina
      titulo="Convertir en proyecto"
      descripcion="Completa el plan inicial del proyecto. La iniciativa y su equipo se conservarán."
    >
      {resultado.cargando ? (
        <Cargando />
      ) : resultado.error ? (
        <ErrorConsulta error={resultado.error} recargar={resultado.recargar} />
      ) : !permitida ? (
        <p role="alert" className="alert alert-warning">
          Solo el propietario puede convertir una iniciativa publicada o en
          formación de equipo, con al menos otro integrante y sin un proyecto
          anterior.
        </p>
      ) : (
        <Conversion iniciativa={iniciativa} />
      )}
    </Pagina>
  )
}
