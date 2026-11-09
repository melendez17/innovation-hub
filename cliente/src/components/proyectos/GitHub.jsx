import { useEffect, useState } from 'react'
import { fecha } from '../../utils/formatos'
import { Cargando } from '../comunes/Estados'
export default function GitHub({ repositorioUrl }) {
  const [revision, setRevision] = useState(0)
  const clave = `${repositorioUrl}|${revision}`
  const [resultado, setEstado] = useState({ clave: '', cargando: true })
  const estado = resultado.clave === clave ? resultado : { cargando: true }
  useEffect(() => {
    if (!repositorioUrl) return
    const controlador = new AbortController()
    let agotado = false
    const tiempo = setTimeout(() => {
      agotado = true
      controlador.abort()
    }, 10000)
    async function cargar() {
      try {
        const url = new URL(repositorioUrl)
        const partes = url.pathname
          .replace(/\/$/, '')
          .replace(/\.git$/, '')
          .split('/')
          .filter(Boolean)
        if (url.origin !== 'https://github.com' || partes.length !== 2)
          throw new Error('La dirección del repositorio no es válida.')
        const base = (
          import.meta.env.VITE_GITHUB_API_URL || 'https://api.github.com'
        ).replace(/\/$/, '')
        const respuesta = await fetch(
          `${base}/repos/${partes.map(encodeURIComponent).join('/')}`,
          {
            headers: { Accept: 'application/vnd.github+json' },
            signal: controlador.signal,
          },
        )
        if (
          respuesta.status === 429 ||
          (respuesta.status === 403 &&
            respuesta.headers.get('x-ratelimit-remaining') === '0')
        )
          throw new Error(
            'GitHub alcanzó su límite de consultas. Inténtalo de nuevo más tarde.',
          )
        if ([403, 404].includes(respuesta.status))
          throw new Error(
            'El repositorio no existe, es privado o no permite acceso público.',
          )
        if (!respuesta.ok)
          throw new Error(
            'GitHub no está disponible en este momento. Inténtalo más tarde.',
          )
        let datos
        try {
          datos = await respuesta.json()
        } catch {
          throw new Error('GitHub devolvió una respuesta que no pudimos leer.')
        }
        let enlaceValido = false
        try {
          enlaceValido = new URL(datos.html_url).origin === 'https://github.com'
        } catch {
          /* La validación se informa abajo. */
        }
        if (
          typeof datos.name !== 'string' ||
          typeof datos.owner?.login !== 'string' ||
          typeof datos.default_branch !== 'string' ||
          typeof datos.updated_at !== 'string' ||
          Number.isNaN(new Date(datos.updated_at).getTime()) ||
          !Number.isInteger(datos.open_issues_count) ||
          datos.open_issues_count < 0 ||
          !(
            datos.description === null || typeof datos.description === 'string'
          ) ||
          !(datos.language === null || typeof datos.language === 'string') ||
          !enlaceValido
        )
          throw new Error(
            'La información recibida de GitHub está incompleta o tiene un formato inválido.',
          )
        if (!controlador.signal.aborted)
          setEstado({ clave, datos, cargando: false })
      } catch (error) {
        if (!controlador.signal.aborted || agotado)
          setEstado({
            clave,
            cargando: false,
            error: agotado
              ? 'GitHub tardó demasiado en responder. Inténtalo de nuevo.'
              : error instanceof TypeError
                ? 'No pudimos conectar con GitHub. Revisa tu conexión e inténtalo de nuevo.'
                : error.message,
          })
      } finally {
        clearTimeout(tiempo)
      }
    }
    cargar()
    return () => {
      clearTimeout(tiempo)
      controlador.abort()
    }
  }, [repositorioUrl, revision, clave])
  const datos = estado.datos
  return (
    <section className="seccion-detalle">
      <h2>Repositorio de GitHub</h2>
      {!repositorioUrl ? (
        <p className="texto-secundario">
          Este proyecto no tiene un repositorio registrado.
        </p>
      ) : estado.cargando ? (
        <Cargando texto="Consultando GitHub…" />
      ) : estado.error ? (
        <div className="alert alert-warning" role="alert">
          <p>{estado.error}</p>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() => setRevision((v) => v + 1)}
          >
            Reintentar consulta de GitHub
          </button>
        </div>
      ) : (
        datos && (
          <div className="resumen-lateral">
            <h3>
              <a href={datos.html_url} target="_blank" rel="noreferrer">
                {datos.owner.login}/{datos.name} (nueva pestaña)
              </a>
            </h3>
            <p>{datos.description || 'Sin descripción en GitHub.'}</p>
            <dl className="row mb-0">
              <dt className="col-sm-6">Lenguaje principal</dt>
              <dd className="col-sm-6">
                {datos.language || 'Sin especificar'}
              </dd>
              <dt className="col-sm-6">Rama predeterminada</dt>
              <dd className="col-sm-6">{datos.default_branch}</dd>
              <dt className="col-sm-6">Última actualización</dt>
              <dd className="col-sm-6">{fecha(datos.updated_at)}</dd>
              <dt className="col-sm-6">Issues abiertos</dt>
              <dd className="col-sm-6">{datos.open_issues_count}</dd>
            </dl>
          </div>
        )
      )}
      {repositorioUrl && (
        <p className="mt-3">
          <a href={repositorioUrl} target="_blank" rel="noreferrer">
            Abrir repositorio registrado (nueva pestaña)
          </a>
        </p>
      )}
    </section>
  )
}
