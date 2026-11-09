import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SesionProvider } from './auth/Sesion'
import RutaPrivada from './auth/RutaPrivada'
import Estructura from './components/layout/Estructura'
import Inicio from './paginas/Inicio'
import Catalogo from './paginas/Catalogo'
import Iniciativa from './paginas/Iniciativa'
import FormIniciativa from './paginas/FormIniciativa'
import Acceso from './paginas/Acceso'
import Perfil from './paginas/Perfil'
import EditarPerfil from './paginas/EditarPerfil'
import Personas from './paginas/Personas'
import FormSolicitud from './paginas/FormSolicitud'
import Solicitudes from './paginas/Solicitudes'
import Solicitud from './paginas/Solicitud'
import Proyectos from './paginas/Proyectos'
import Proyecto from './paginas/Proyecto'
import FormProyecto from './paginas/FormProyecto'
import NoEncontrado from './paginas/NoEncontrado'
const privada = (pagina) => <RutaPrivada>{pagina}</RutaPrivada>
export default function App() {
  return (
    <SesionProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Estructura />}>
            <Route index element={<Inicio />} />
            <Route path="ingresar" element={<Acceso key="ingresar" />} />
            <Route
              path="registro"
              element={<Acceso key="registro" registro />}
            />
            <Route path="catalogo" element={<Catalogo />} />
            <Route
              path="iniciativas/nueva"
              element={privada(<FormIniciativa />)}
            />
            <Route path="iniciativa/:id" element={<Iniciativa />} />
            <Route
              path="iniciativa/:id/editar"
              element={privada(<FormIniciativa />)}
            />
            <Route
              path="iniciativa/:id/solicitar"
              element={privada(<FormSolicitud />)}
            />
            <Route
              path="iniciativa/:id/solicitudes"
              element={privada(<Solicitudes />)}
            />
            <Route
              path="iniciativa/:id/convertir"
              element={privada(<FormProyecto />)}
            />
            <Route path="perfil" element={privada(<Perfil />)} />
            <Route path="perfil/editar" element={privada(<EditarPerfil />)} />
            <Route path="personas" element={privada(<Personas />)} />
            <Route path="usuarios/:id" element={privada(<Perfil />)} />
            <Route path="solicitudes" element={privada(<Solicitudes />)} />
            <Route path="solicitudes/:id" element={privada(<Solicitud />)} />
            <Route
              path="solicitudes/:id/editar"
              element={privada(<FormSolicitud editar />)}
            />
            <Route path="proyectos" element={<Proyectos />} />
            <Route path="proyectos/:id" element={<Proyecto />} />
            <Route path="*" element={<NoEncontrado />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SesionProvider>
  )
}
