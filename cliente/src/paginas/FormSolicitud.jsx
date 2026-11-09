import { useNavigate, useParams } from 'react-router-dom'
import { useSesion } from '../hooks/useSesion'
import { pedir } from '../api/cliente'
import { useConsulta } from '../hooks/useConsulta'
import { useFormulario } from '../hooks/useFormulario'
import { validarSolicitud } from '../utils/validaciones'
import Pagina from '../components/layout/Pagina'
import Formulario, {
  CampoFormulario as Campo,
} from '../components/comunes/Formulario'
import { Cargando, ErrorConsulta } from '../components/comunes/Estados'
function Edicion({ solicitud, iniciativa, competencias }) {
  const navegar = useNavigate()
  const { usuario } = useSesion()
  const formulario = useFormulario(
    {
      mensaje: solicitud?.mensaje || '',
      competenciaId: solicitud?.competenciaId || '',
      rol: solicitud?.rol || '',
      disponibilidad: solicitud?.disponibilidad || usuario.disponibilidad || '',
    },
    validarSolicitud,
    async (datos) => {
      const guardada = await pedir(
        solicitud
          ? `/solicitudes/${solicitud._id}`
          : `/iniciativas/${iniciativa._id}/solicitudes`,
        solicitud ? 'PUT' : 'POST',
        datos,
      )
      navegar(`/solicitudes/${guardada._id}`, {
        state: {
          mensaje: solicitud
            ? 'Solicitud actualizada.'
            : 'Solicitud enviada. Queda pendiente de la decisión del propietario.',
        },
      })
    },
  )
  return (
    <Formulario
      formulario={formulario}
      texto={solicitud ? 'Guardar cambios' : 'Enviar solicitud'}
      cancelar={
        solicitud
          ? `/solicitudes/${solicitud._id}`
          : `/iniciativa/${iniciativa._id}`
      }
    >
      <p>
        Iniciativa:{' '}
        <strong>{solicitud?.iniciativa.titulo || iniciativa.titulo}</strong>
      </p>
      <Campo
        formulario={formulario}
        nombre="mensaje"
        etiqueta="Mensaje de presentación"
        tipo="textarea"
        required
      />
      <Campo
        formulario={formulario}
        nombre="competenciaId"
        etiqueta="Competencia que aportas"
        opciones={[
          {
            valor: '',
            texto: competencias.length
              ? 'Seleccionar…'
              : 'No hay competencias disponibles',
          },
          ...competencias.map((c) => ({ valor: c._id, texto: c.nombre })),
        ]}
        ayuda="Una habilidad que puedes aportar, por ejemplo programación o diseño."
        required
      />
      <Campo
        formulario={formulario}
        nombre="rol"
        etiqueta="Rol deseado"
        ayuda="La función que te gustaría desempeñar en el equipo."
        required
      />
      <Campo
        formulario={formulario}
        nombre="disponibilidad"
        etiqueta="Disponibilidad"
        required
      />
    </Formulario>
  )
}
export default function FormSolicitud({ editar = false }) {
  const { id } = useParams()
  const { usuario } = useSesion()
  const resultado = useConsulta(
    editar ? `/solicitudes/${id}` : `/iniciativas/${id}`,
  )
  const catalogo = useConsulta('/competencias')
  const datos = resultado.datos
  const permitida = editar
    ? datos?.solicitanteId === usuario._id && datos.estado === 'Pendiente'
    : datos &&
      datos.propietarioId !== usuario._id &&
      !datos.miembros?.some((m) => m._id === usuario._id) &&
      (datos.accesoCompleto === false ||
        ['Publicada', 'En formación de equipo'].includes(datos.estado))
  return (
    <Pagina
      titulo={editar ? 'Editar solicitud pendiente' : 'Solicitar participación'}
      descripcion="Enviar una solicitud todavía no te incorpora al equipo."
    >
      {resultado.cargando || catalogo.cargando ? (
        <Cargando />
      ) : resultado.error || catalogo.error ? (
        <ErrorConsulta
          error={resultado.error || catalogo.error}
          recargar={() => {
            resultado.recargar()
            catalogo.recargar()
          }}
        />
      ) : !permitida ? (
        <p className="alert alert-warning" role="alert">
          Esta solicitud no se puede realizar o editar. Solo el solicitante
          puede editar mientras siga pendiente.
        </p>
      ) : !catalogo.datos?.length ? (
        <p className="alert alert-warning">
          No hay competencias en el catálogo. No se puede enviar la solicitud
          hasta que estén disponibles.
        </p>
      ) : (
        <Edicion
          solicitud={editar ? datos : null}
          iniciativa={editar ? null : datos}
          competencias={catalogo.datos}
        />
      )}
    </Pagina>
  )
}
