function TarjetaIniciativa({ iniciativa, usuarioActivo }) {
    if (!iniciativa) return null

    if (iniciativa.visibilidad === "Privada" && usuarioActivo.nombre != iniciativa.propietario) return null

    console.log("Tarjeta " + iniciativa.visibilidad + " " + iniciativa.propietario)
    console.log(iniciativa.visibilidad === "Restringida" && usuarioActivo.nombre != iniciativa.propietario)

    console.log(usuarioActivo.nombre + " " + iniciativa.propietario)
    console.log(usuarioActivo.nombre != iniciativa.propietario)


    if (iniciativa.visibilidad === "Restringida" && usuarioActivo.nombre != iniciativa.propietario) {
        return (
            <article className="col-11 col-sm-5 col-lg-3 p-2 tarjeta-iniciativa d-flex flex-column gap-1 justify-content-between">
                <div className="d-flex justify-content-between gap-3 encabezado-tarjeta">
                    <h3>{iniciativa.titulo}</h3>
                    <p>{iniciativa.tipo}</p>
                </div>
                <div className="resumen">
                    <p>{iniciativa.resumen}</p>
                </div>
                <div className="categoria d-flex justify-content-between">
                    <p className="etiqueta">Categoria: </p>
                    <p>{iniciativa.categoria}</p>
                </div>
                <div className="competencias d-flex flex-column">
                    <p className="etiqueta">Competencias Requeridas: </p>
                    {iniciativa.competencias.map((competencia, index) => (
                        <p key={index}>{competencia}</p>
                    ))}
                </div>
            </article>
        )
    }


    if (iniciativa.visibilidad === "Institucional" && usuarioActivo.email.endsWith("@ucenfotec.ac.cr") || iniciativa.visibilidad === "Pública" || usuarioActivo.nombre === iniciativa.propietario) {
        return (
            <article className="col-11 col-sm-5 col-lg-3 p-2 tarjeta-iniciativa d-flex flex-column gap-1 justify-content-between">
                <div className="d-flex justify-content-between gap-3 encabezado-tarjeta">
                    <h3>{iniciativa.titulo}</h3>
                    <p>{iniciativa.tipo}</p>
                </div>
                <div className="resumen">
                    <p>{iniciativa.resumen}</p>
                </div>
                <div className="categoria d-flex justify-content-between">
                    <p className="etiqueta">Categoria: </p>
                    <p>{iniciativa.categoria}</p>
                </div>
                <div className="propietario d-flex justify-content-between">
                    <p className="etiqueta">Propietario: </p>
                    <p>{iniciativa.propietario}</p>
                </div>
                <div className="estado d-flex justify-content-between">
                    <p className="etiqueta">Estado:</p>
                    <p>{iniciativa.estado}</p>
                </div>
                <div className="competencias d-flex flex-column">
                    <p className="etiqueta">Competencias Requeridas: </p>
                    {iniciativa.competencias.map((competencia, index) => (
                        <p key={index}>{competencia}</p>
                    ))}
                </div>
                <a role="button" className="btn btn-primary btn-detalles-iniciativa">Detalle</a>
            </article>
        )
    } else {
        return null
    }
}

export default TarjetaIniciativa