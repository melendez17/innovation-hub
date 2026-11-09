import { useListado } from '../hooks/useListado'
import { Link } from 'react-router-dom'
import { useSesion } from '../hooks/useSesion'
import { fecha, nombreCompleto } from '../utils/formatos'
import Pagina from '../components/layout/Pagina'
import Listado, { Filtros } from '../components/comunes/Listado'
import { EtiquetaEstado } from '../components/comunes/Estados'
export default function Proyectos() {
  const { usuario } = useSesion()
  const resultado = useListado('/proyectos', {
    ambito: '',
    sort: '-fechaCreacion',
  })
  return (
    <Pagina
      titulo="Proyectos"
      descripcion="Iniciativas que ya dieron el paso a un proyecto con equipo."
    >
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
                    { valor: 'propias', texto: 'Mis proyectos' },
                    { valor: 'equipo', texto: 'Proyectos de mi equipo' },
                  ],
                },
              ]
            : []),
          {
            nombre: 'sort',
            etiqueta: 'Orden',
            opciones: [
              { valor: '-fechaCreacion', texto: 'Más recientes' },
              { valor: 'fechaCreacion', texto: 'Más antiguos' },
            ],
          },
        ]}
      />
      <Listado
        resultado={resultado}
        vacio="Todavía no hay proyectos disponibles en esta vista."
      >
        {(items) => (
          <div className="row g-4">
            {items.map((p) => (
              <div className="col-md-6 col-xl-4" key={p._id}>
                <article className="tarjeta-proyecto">
                  <EtiquetaEstado estado={p.estado} />
                  <h2>
                    <Link to={`/proyectos/${p._id}`}>{p.nombre}</Link>
                  </h2>
                  <p>{p.objetivo}</p>
                  <p className="small texto-secundario">
                    {nombreCompleto(p.propietario)} · {fecha(p.fechaCreacion)}
                  </p>
                  <div className="tarjeta-pie">
                    <Link to={`/proyectos/${p._id}`}>Ver proyecto</Link>
                  </div>
                </article>
              </div>
            ))}
          </div>
        )}
      </Listado>
    </Pagina>
  )
}
