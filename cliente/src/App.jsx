import ListaIniciativas from './components/iniciativas/ListaIniciativas'
import Encabezado from './components/layout/Encabezado.jsx'
import { iniciativasPruebas, CATEGORIAS, TIPOS, COMPETENCIAS, USUARIO } from './dataPrueba/iniciativas.js'
import BarraBusqueda from './components/filtros/BarraBusqueda.jsx'

function App() {
  return (
    <main>
      <Encabezado />
      <BarraBusqueda categorias={CATEGORIAS} tipos={TIPOS} competencias={COMPETENCIAS}/>
      <ListaIniciativas iniciativas={iniciativasPruebas} usuarioActivo={USUARIO}/>
    </main>
  )
}

export default App
