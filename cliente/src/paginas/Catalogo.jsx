import { opcionesTodas } from '../utils/opciones'
import { useListado } from '../hooks/useListado'
import { Link } from 'react-router-dom'
import { useSesion } from '../hooks/useSesion'
import { useConsulta } from '../hooks/useConsulta'
import {
  TIPOS,
  CATEGORIAS,
  VISIBILIDADES,
  ESTADOS_INICIATIVA,
} from '../datos/catalogos'
import Pagina from '../components/layout/Pagina'
import ListaIniciativas from '../components/iniciativas/ListaIniciativas'
import Listado, { Filtros } from '../components/comunes/Listado'
import Campo from '../components/comunes/Campo'
import { ErrorConsulta } from '../components/comunes/Estados'
import SelectorPropietario from '../components/comunes/SelectorPropietario'
export default function Catalogo() {
  const { usuario } = useSesion()
  const competencias = useConsulta('/competencias')
  const resultado = useListado('/iniciativas', {
    q: '',
    tipo: '',
    categoria: '',
    competenciaId: '',
    estado: '',
    propietarioId: '',
    visibilidad: '',
    conEspacios: '',
    ambito: '',
    sort: '-fechaCreacion',
  })
  return (
    <Pagina
      titulo="Catálogo de iniciativas"
      descripcion="Encuentra ideas, necesidades y retos en los que puedes aportar."
      acciones={
        usuario ? (
          <Link className="btn btn-primary" to="/iniciativas/nueva">
            Crear iniciativa
          </Link>
        ) : (
          <Link className="btn btn-outline-primary" to="/ingresar">
            Ingresar para participar
          </Link>
        )
      }
    >
      {competencias.error && (
        <ErrorConsulta
          error={competencias.error}
          recargar={competencias.recargar}
        />
      )}
      <Filtros
        key={JSON.stringify(resultado.valores)}
        valores={resultado.valores}
        aplicar={resultado.aplicar}
        campos={[
          ...(usuario
            ? [
                {
                  nombre: 'ambito',
                  etiqueta: 'Mostrar',
                  opciones: [
                    { valor: '', texto: 'Catálogo general' },
                    { valor: 'propias', texto: 'Mis iniciativas' },
                    { valor: 'equipo', texto: 'Iniciativas de mi equipo' },
                  ],
                },
              ]
            : []),
          {
            nombre: 'q',
            etiqueta: 'Buscar iniciativas',
            placeholder: 'Título, resumen o etiqueta',
          },
          { nombre: 'tipo', etiqueta: 'Tipo', opciones: opcionesTodas(TIPOS) },
          {
            nombre: 'categoria',
            etiqueta: 'Categoría',
            opciones: opcionesTodas(CATEGORIAS),
          },
        ]}
      >
        {(datos, cambiar) => (
          <details>
            <summary>Más filtros y orden</summary>
            <div className="row g-3 mt-1">
              <div className="col-md-4">
                <Campo
                  etiqueta="Competencia"
                  nombre="competenciaId"
                  valor={datos.competenciaId}
                  onChange={(v) => cambiar('competenciaId', v)}
                  opciones={[
                    {
                      valor: '',
                      texto: competencias.cargando ? 'Cargando…' : 'Todas',
                    },
                    ...(competencias.datos || []).map((c) => ({
                      valor: c._id,
                      texto: c.nombre,
                    })),
                  ]}
                />
              </div>
              <div className="col-md-4">
                <Campo
                  etiqueta="Visibilidad"
                  nombre="visibilidad"
                  valor={datos.visibilidad}
                  onChange={(v) => cambiar('visibilidad', v)}
                  opciones={opcionesTodas(
                    usuario ? VISIBILIDADES : ['Pública'],
                  )}
                />
              </div>
              <div className="col-md-4">
                <Campo
                  etiqueta="Estado"
                  nombre="estado"
                  valor={datos.estado}
                  onChange={(v) => cambiar('estado', v)}
                  opciones={opcionesTodas(ESTADOS_INICIATIVA)}
                />
              </div>
              <div className="col-md-4">
                <Campo
                  etiqueta="Espacios disponibles"
                  nombre="conEspacios"
                  valor={datos.conEspacios}
                  onChange={(v) => cambiar('conEspacios', v)}
                  opciones={[
                    { valor: '', texto: 'Cualquier capacidad' },
                    { valor: 'true', texto: 'Con espacios' },
                    { valor: 'false', texto: 'Sin espacios' },
                  ]}
                />
              </div>
              <div className="col-md-4">
                <Campo
                  etiqueta="Orden"
                  nombre="sort"
                  valor={datos.sort}
                  onChange={(v) => cambiar('sort', v)}
                  opciones={[
                    { valor: '-fechaCreacion', texto: 'Más recientes' },
                    { valor: 'fechaCreacion', texto: 'Más antiguas' },
                    { valor: 'titulo', texto: 'Título A–Z' },
                    { valor: '-titulo', texto: 'Título Z–A' },
                  ]}
                />
              </div>
            </div>
            {usuario && (
              <SelectorPropietario
                valor={datos.propietarioId}
                onCambiar={(v) => cambiar('propietarioId', v)}
              />
            )}
            <p className="small texto-secundario">
              Los filtros respetan tu acceso. Una restringida muestra solo su
              resumen; las privadas se consultan desde tus iniciativas o las de
              tu equipo.
            </p>
          </details>
        )}
      </Filtros>
      <Listado resultado={resultado}>
        {(items) => <ListaIniciativas iniciativas={items} />}
      </Listado>
    </Pagina>
  )
}
