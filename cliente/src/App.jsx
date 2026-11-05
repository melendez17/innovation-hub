import ListaIniciativas from './components/iniciativas/ListaIniciativas'
import {iniciativasPruebas} from './dataPrueba/iniciativas.js'

function App() {
  return(
    <ListaIniciativas iniciativas={iniciativasPruebas}/>
  )
}

export default App
