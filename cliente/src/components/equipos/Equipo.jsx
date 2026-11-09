import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSesion } from '../../hooks/useSesion'
import { useConsulta } from '../../hooks/useConsulta'
import { pedir } from '../../api/cliente'
import { nombreCompleto, fecha } from '../../utils/formatos'
import Competencias from '../comunes/Competencias'
import Confirmacion from '../comunes/Confirmacion'
import { Cargando, ErrorConsulta, Vacio } from '../comunes/Estados'
export function TablaEquipo({
  miembros,
  propietarioId,
  permitirRetiro,
  onRetirar,
}) {
  const { usuario } = useSesion()
  return miembros.length ? (
    <div className="tabla-contenedor" tabIndex={0} role="region" aria-label="Tabla desplazable horizontalmente">
      <table className="table">
        <caption className="visually-hidden">
          Integrantes activos del equipo
        </caption>
        <thead>
          <tr>
            <th scope="col">Integrante</th>
            <th scope="col">Competencias</th>
            <th scope="col">Rol e incorporación</th>
            {permitirRetiro && <th scope="col">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {miembros.map((miembro) => (
            <tr key={miembro.usuarioId}>
              <td>
                {usuario ? (
                  <Link to={`/usuarios/${miembro.usuarioId}`}>
                    {nombreCompleto(miembro)}
                  </Link>
                ) : (
                  nombreCompleto(miembro)
                )}
                <div className="small texto-secundario mt-1">
                  {miembro.carrera}
                </div>
              </td>
              <td>
                <Competencias valores={miembro.competencias} />
              </td>
              <td>
                {miembro.rol}
                <div className="small texto-secundario mt-1">
                  {fecha(miembro.fechaIncorporacion)}
                </div>
              </td>
              {permitirRetiro && (
                <td>
                  {miembro.usuarioId !== propietarioId && (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => onRetirar(miembro)}
                    >
                      Retirar{' '}
                      <span className="visually-hidden">
                        a {nombreCompleto(miembro)}
                      </span>
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <Vacio titulo="No hay integrantes disponibles" />
  )
}
export default function Equipo({ iniciativa, alCambiar }) {
  const { usuario } = useSesion()
  const resultado = useConsulta(`/iniciativas/${iniciativa._id}/miembros`)
  const [retirar, setRetirar] = useState(null)
  return (
    <section className="seccion-detalle">
      <h2>Equipo</h2>
      {resultado.cargando ? (
        <Cargando />
      ) : resultado.error ? (
        <ErrorConsulta error={resultado.error} recargar={resultado.recargar} />
      ) : (
        resultado.datos && (
          <TablaEquipo
            miembros={resultado.datos}
            propietarioId={iniciativa.propietarioId}
            permitirRetiro={
              usuario?._id === iniciativa.propietarioId &&
              iniciativa.estado !== 'Archivada'
            }
            onRetirar={setRetirar}
          />
        )
      )}
      <Confirmacion
        abierta={Boolean(retirar)}
        titulo="Retirar integrante"
        descripcion={`¿Retirar a ${nombreCompleto(retirar)} del equipo? Se conservará su historial y perderá el acceso reservado a integrantes.`}
        textoConfirmar="Retirar integrante"
        peligrosa
        pedirTexto
        onCerrar={() => setRetirar(null)}
        onConfirmar={async (motivo) => {
          await pedir(
            `/iniciativas/${iniciativa._id}/miembros/${retirar.usuarioId}/retiro`,
            'POST',
            { motivo },
          )
          resultado.recargar()
          alCambiar()
        }}
      />
    </section>
  )
}
