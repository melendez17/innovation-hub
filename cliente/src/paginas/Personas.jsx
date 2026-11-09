import { useListado } from '../hooks/useListado'
import { Link } from 'react-router-dom'
import { useConsulta } from '../hooks/useConsulta'
import { nombreCompleto } from '../utils/formatos'
import Pagina from '../components/layout/Pagina'
import { ErrorConsulta } from '../components/comunes/Estados'
import Competencias from '../components/comunes/Competencias'
import Listado, { Filtros } from '../components/comunes/Listado'
export default function Personas() {
  const competencias = useConsulta('/competencias')
  const resultado = useListado('/usuarios', {
    q: '',
    carrera: '',
    disponibilidad: '',
    competenciaId: '',
    sort: 'nombre',
  })
  return (
    <Pagina
      titulo="Personas de la comunidad"
      descripcion="Busca habilidades y conoce a quienes pueden colaborar contigo."
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
          { nombre: 'q', etiqueta: 'Nombre o apellidos' },
          {
            nombre: 'carrera',
            etiqueta: 'Carrera o área',
            ayuda: 'Escribe el nombre completo de la carrera.',
          },
          { nombre: 'disponibilidad', etiqueta: 'Disponibilidad' },
          {
            nombre: 'competenciaId',
            etiqueta: 'Competencia',
            opciones: [
              { valor: '', texto: 'Todas' },
              ...(competencias.datos || []).map((c) => ({
                valor: c._id,
                texto: c.nombre,
              })),
            ],
          },
          {
            nombre: 'sort',
            etiqueta: 'Orden',
            opciones: [
              { valor: 'nombre', texto: 'Nombre A–Z' },
              { valor: '-nombre', texto: 'Nombre Z–A' },
              { valor: 'apellido1', texto: 'Apellido A–Z' },
              { valor: '-apellido1', texto: 'Apellido Z–A' },
            ],
          },
        ]}
      />
      <Listado resultado={resultado}>
        {(items) => (
          <div className="row g-4">
            {items.map((persona) => (
              <div key={persona._id} className="col-md-6 col-xl-4">
                <article className="tarjeta-iniciativa">
                  <h2>
                    <Link to={`/usuarios/${persona._id}`}>
                      {nombreCompleto(persona)}
                    </Link>
                  </h2>
                  <p>
                    {persona.carrera} · {persona.tipo}
                  </p>
                  <Competencias valores={persona.competencias} />
                  <p className="small texto-secundario">
                    {persona.disponibilidad || 'Disponibilidad sin especificar'}
                  </p>
                </article>
              </div>
            ))}
          </div>
        )}
      </Listado>
    </Pagina>
  )
}
