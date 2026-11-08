import { createBrowserRouter, RouterProvider } from "react-router"

import Inicio from './paginas/Inicio.jsx'
import Catalogo from './paginas/Catalogo.jsx'
import NoEncontrado from "./paginas/NoEncontrado.jsx"

const router = createBrowserRouter([
  {
    path: "/",
    element: <Inicio />,
    errorElement: <NoEncontrado />
  }, 
  {
    path: "/catalogo",
    element: <Catalogo />,
    errorElement: <NoEncontrado />
  }
])

function App() {
  return (
    <RouterProvider router={router} />
  )
}
 export default App


