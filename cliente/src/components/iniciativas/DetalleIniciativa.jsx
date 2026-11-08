import { useState, useEffect } from "react"
import { obtenerIniciativaId } from "../../api/iniciativasApi"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from "@fortawesome/free-solid-svg-icons"

function DetalleIniciativa({ id }) {
    // Inicializar como null para saber si ya cargaron los datos
    const [iniciativa, setIniciativa] = useState(null)
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function cargar() {
            try {
                const resultado = await obtenerIniciativaId(id)
                setIniciativa(resultado)
            } catch (err) {
                setError(err.message)
            } finally {
                setCargando(false)
            }
        }
        cargar()
    }, [id])

    // Prevenir errores mientras descarga la información de la API
    if (cargando) return <p>Cargando iniciativa...</p>
    if (error) return <p>Error: {error}</p>
    if (!iniciativa) return <p>No se encontró la iniciativa.</p>

    return (
        <div className="row cuerpo-iniciativa">
            <header className="col-12 encabezado-iniciativa position-relative">
                <div className="pe-4">
                    <h2 className="titulo-iniciativa m-0">{iniciativa.titulo}</h2>
                    <p>
                        Por <span className="propietario-iniciativa">
                            {`${iniciativa.propietario?.nombre ?? ''} ${iniciativa.propietario?.apellido1 ?? ''} ${iniciativa.propietario?.apellido2 ?? ''}`}
                        </span>
                    </p>
                </div>
                <div className="position-absolute top-0 end-0">
                    <button className="btn btn-outline-primary position-relative px-2 m-1" type="button"
                        aria-label="Opciones" data-bs-toggle="collapse" data-bs-target="#opciones">
                        <i className="fa-solid fa-ellipsis-vertical fa-xl" aria-hidden="true"></i>
                    </button>
                    <div id="opciones" className="collapse list-group position-absolute top-100 end-0">
                        <button className="list-group-item d-flex gap-3 align-items-center btn-editar" id="editar">
                            <i className="fa-solid fa-pen-to-square" aria-hidden="true"></i><span>Editar</span>
                        </button>
                        <button className="list-group-item d-flex gap-3 align-items-center btn-eliminar" id="eliminar">
                            <i className="fa-regular fa-trash-can" aria-hidden="true"></i><span>Eliminar</span>
                        </button>
                    </div>
                </div>
            </header>

            <section className="col-12 col-md-9 d-flex flex-column justify-content-evenly justify-content-md-between gap-3 p-3">
                <p className="descripcion-iniciativa" id="descripcion">{iniciativa.descripcion}</p>
                
                <div className="contenedor-competencias mt-md-5">
                    <h3 className="etiqueta">Competencias Requeridas</h3>
                    <div className="d-flex gap-2 flex-wrap mt-1">
                        {iniciativa.competencias?.map((competencia) => (
                            <p className="card m-0 p-1 d-flex flex-row align-items-center gap-1 tarjeta-competencia" key={competencia._id}>
                                <FontAwesomeIcon icon={faCheck} size="xs"/>
                                <span>{competencia.nombre}</span>
                            </p>
                        ))}
                    </div>
                </div>

                <div className="contenerdor-miembros">
                    <h3 className="etiqueta">Miembros</h3>
                    <div className="d-flex gap-2 flex-wrap mt-1">
                        {iniciativa.miembros?.map((miembro) => (
                            <p className="card m-0 p-1 d-flex flex-row align-items-center gap-1 tarjeta-miembro" key={miembro._id}>
                                <FontAwesomeIcon icon={faCheck} size="xs"/>
                                <span>{`${miembro.nombre ?? ''} ${miembro.apellido1 ?? ''} ${miembro.apellido2 ?? ''}`}</span>
                            </p>
                        ))}
                    </div>
                </div>
            </section>

            <aside className="col-12 col-md-3 caracteristicas-iniciativa d-flex flex-column justify-content-between gap-2 p-3">
                <div className="contenedor-tipo">
                    <h3 className="etiqueta">Tipo</h3>
                    <p>{iniciativa.tipo}</p>
                </div>
                <div className="contenedor-categoria">
                    <h3 className="etiqueta">Categoría</h3>
                    <p>{iniciativa.categoria}</p>
                </div>
                <div className="contenedor-estado">
                    <h3 className="etiqueta">Estado</h3>
                    <p>{iniciativa.estado}</p>
                </div>
                <div className="contenedor-visibilidad">
                    <h3 className="etiqueta">Nivel de Visibilidad</h3>
                    <p>{iniciativa.visibilidad}</p>
                </div>

                <a href="./formulario-inscripcion.html"
                    className="btn btn-outline-primary btn-inscribirse d-flex gap-3 align-items-center" id="inscribirse">
                    <i className="fa-solid fa-clipboard-check fa-sm" aria-hidden="true"></i>Inscribirse
                </a>
            </aside>
        </div>
    )
}

export default DetalleIniciativa