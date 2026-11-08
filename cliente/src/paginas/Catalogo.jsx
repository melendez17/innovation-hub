import ListaIniciativas from './components/iniciativas/ListaIniciativas'
import Pagina from './components/layout/Pagina.jsx'
import { iniciativasPruebas, CATEGORIAS, TIPOS, COMPETENCIAS, USUARIO } from './dataPrueba/iniciativas.js'
import BarraBusqueda from './components/filtros/BarraBusqueda.jsx'
import Filtro from './components/filtros/Filtro.jsx'
import { useState } from 'react'

function Catalogo() {

  const [filtroCategoria, setFiltroCategoria] = useState('Todos')
  const [filtroTipo, setFiltroTipo] = useState('Todos')
  const [filtroCompetencia, setFiltroCompetencia] = useState('Todos')
  const iniciativas = iniciativasPruebas
  const visibles = iniciativas.filter(
    (iniciativa) =>
      (filtroCategoria === 'Todos' || iniciativa.categoria === filtroCategoria) &&
      (filtroTipo === 'Todos' || iniciativa.tipo === filtroTipo) &&
      (filtroCompetencia === 'Todos' || iniciativa.competencias.includes(filtroCompetencia))
  )

  console.log(visibles)

  return (
    <Pagina titulo="Catálogo">
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
