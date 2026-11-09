import { useNavigate, useParams } from 'react-router-dom'
import { useConsulta } from '../hooks/useConsulta'
import { useFormulario } from '../hooks/useFormulario'
import { useSesion } from '../hooks/useSesion'
import { pedir } from '../api/cliente'
import { validarIniciativa } from '../utils/validaciones'
import {
  TIPOS,
  CATEGORIAS,
  VISIBILIDADES,
  AYUDA_VISIBILIDAD,
} from '../datos/catalogos'
import Pagina from '../components/layout/Pagina'
import Formulario, {
  CampoFormulario as Campo,
} from '../components/comunes/Formulario'
import SelectorCompetencias from '../components/comunes/SelectorCompetencias'
import ListaTextos from '../components/comunes/ListaTextos'
import { Cargando, ErrorConsulta } from '../components/comunes/Estados'
function Edicion({ iniciativa }) {
  const navegar = useNavigate()
  const iniciales = {
    titulo: '',
    tipo: 'Idea',
    resumen: '',
    descripcion: '',
    problema: '',
    beneficiados: '',
    categoria: '',
    competencias: [],
    cantidadIntegrantes: 2,
    visibilidad: 'Pública',
    etiquetas: [],
  }
  if (iniciativa)
    for (const campo of Object.keys(iniciales))
      iniciales[campo] =
        campo === 'competencias'
          ? iniciativa.competencias.map((c) => c._id)
          : (iniciativa[campo] ?? iniciales[campo])
  const formulario = useFormulario(
    iniciales,
    (datos) => validarIniciativa(datos, iniciativa?.miembros.length || 1),
    async (datos) => {
      const guardada = await pedir(
        iniciativa ? `/iniciativas/${iniciativa._id}` : '/iniciativas',
        iniciativa ? 'PUT' : 'POST',
        { ...datos, cantidadIntegrantes: Number(datos.cantidadIntegrantes) },
      )
      navegar(`/iniciativa/${guardada._id}`, {
        state: {
          mensaje: iniciativa
            ? 'Iniciativa actualizada.'
            : 'Borrador creado. Revisa sus datos y publícalo cuando esté listo.',
        },
      })
    },
  )
  return (
    <Formulario
      formulario={formulario}
      texto={iniciativa ? 'Guardar cambios' : 'Guardar borrador'}
      cancelar={iniciativa ? `/iniciativa/${iniciativa._id}` : '/catalogo'}
    >
      <Campo
        formulario={formulario}
        nombre="titulo"
        etiqueta="Título"
        required
      />
      <div className="row">
        <div className="col-md-6">
          <Campo
            formulario={formulario}
            nombre="tipo"
            etiqueta="Tipo"
            opciones={TIPOS}
            required
          />
        </div>
        <div className="col-md-6">
          <Campo
            formulario={formulario}
            nombre="categoria"
            etiqueta="Categoría"
            opciones={[{ valor: '', texto: 'Seleccionar…' }, ...CATEGORIAS]}
            required
          />
        </div>
      </div>
      <Campo
        formulario={formulario}
        nombre="resumen"
        etiqueta="Resumen"
        tipo="textarea"
        rows={3}
        ayuda="Presentación breve que también se muestra en iniciativas restringidas."
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
        nombre="problema"
        etiqueta="Problema que se busca resolver"
        tipo="textarea"
      />
      <Campo
        formulario={formulario}
        nombre="beneficiados"
        etiqueta="Personas beneficiadas"
        tipo="textarea"
      />
      <SelectorCompetencias
        valores={formulario.datos.competencias}
        onCambiar={(v) => formulario.cambiar('competencias', v)}
        error={formulario.errores.competencias}
      />
      <div className="row mt-4">
        <div className="col-md-6">
          <Campo
            formulario={formulario}
            nombre="cantidadIntegrantes"
            etiqueta="Cantidad máxima de integrantes"
            tipo="number"
            min={iniciativa?.miembros.length || 1}
            step="1"
            ayuda="Incluye al propietario."
            required
          />
        </div>
        <div className="col-md-6">
          <Campo
            formulario={formulario}
            nombre="visibilidad"
            etiqueta="Visibilidad"
            opciones={VISIBILIDADES}
            ayuda={AYUDA_VISIBILIDAD[formulario.datos.visibilidad]}
            required
          />
        </div>
      </div>
      <ListaTextos
        etiqueta="Etiquetas"
        ejemplo="Ej. reciclaje"
        valores={formulario.datos.etiquetas}
        onCambiar={(v) => formulario.cambiar('etiquetas', v)}
      />
    </Formulario>
  )
}
export default function FormIniciativa() {
  const { id } = useParams()
  const { usuario } = useSesion()
  const resultado = useConsulta(id ? `/iniciativas/${id}` : null)
  const iniciativa = resultado.datos
  const permitida =
    !id ||
    (iniciativa?.propietarioId === usuario._id &&
      iniciativa.estado !== 'Archivada')
  return (
    <Pagina
      titulo={id ? 'Editar iniciativa' : 'Crear iniciativa'}
      descripcion="Registra los datos de tu iniciativa y elige quién puede consultarla."
    >
      {resultado.cargando ? (
        <Cargando />
      ) : resultado.error ? (
        <ErrorConsulta error={resultado.error} recargar={resultado.recargar} />
      ) : !permitida ? (
        <p role="alert" className="alert alert-warning">
          Solo el propietario puede editar una iniciativa que no esté archivada.
        </p>
      ) : (
        (!id || iniciativa) && (
          <Edicion key={id || 'nueva'} iniciativa={iniciativa} />
        )
      )}
    </Pagina>
  )
}
