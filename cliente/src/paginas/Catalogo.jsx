import ListaIniciativas from '../components/iniciativas/ListaIniciativas'
import Pagina from '../components/layout/Pagina.jsx'
import { CATEGORIAS, TIPOS, COMPETENCIAS, USUARIO } from '../dataPrueba/iniciativas.js'
import BarraBusqueda from '../components/filtros/BarraBusqueda.jsx'
import Filtro from '../components/filtros/Filtro.jsx'
import { useState, useEffect } from 'react'
import { obtenerIniciativas } from '../api/iniciativasApi.js'

function Catalogo() {

  const [filtroCategoria, setFiltroCategoria] = useState('Todos')
  const [filtroTipo, setFiltroTipo] = useState('Todos')
  const [filtroCompetencia, setFiltroCompetencia] = useState('Todos')

  const [iniciativas, setIniciativas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const visibles = iniciativas.filter(
    (iniciativa) =>
      (filtroCategoria === 'Todos' || iniciativa.categoria === filtroCategoria) &&
      (filtroTipo === 'Todos' || iniciativa.tipo === filtroTipo) &&
      (filtroCompetencia === 'Todos' || iniciativa.competencias.includes(filtroCompetencia))
  )

  useEffect(() => {
    async function cargar() {
      try {
        const listaIniciativas = await obtenerIniciativas()
        setIniciativas(listaIniciativas)
      } catch (err) {
        setError(err.message)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  if (cargando) {
    return (
      <Pagina>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3">Cargando series…</p>
        </div>
      </Pagina>
    )
  }

  return (
    <Pagina titulo="Catálogo">
      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center">
          <span>{error}</span>
          <button
            type="button"
            className="btn-close"
            aria-label="Cerrar"
            onClick={() => setError('')}
          ></button>
        </div>
      )}

      <BarraBusqueda>
        <Filtro nombre='Categorías' opciones={CATEGORIAS} valor={filtroCategoria} onCambiar={setFiltroCategoria} />
        <Filtro nombre='Tipos' opciones={TIPOS} valor={filtroTipo} onCambiar={setFiltroTipo} />
        <Filtro nombre='Competencias' opciones={COMPETENCIAS} valor={filtroCompetencia} onCambiar={setFiltroCompetencia} />
      </BarraBusqueda>
      <ListaIniciativas iniciativas={visibles} usuarioActivo={USUARIO} />
    </Pagina>
  )
}

export default Catalogo
