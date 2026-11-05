import TarjetaIniciativa from "./TarjetaIniciativa"

function ListaIniciativas({ iniciativas }) {
    if (!iniciativas || iniciativas.length === 0) {
        return (
            <div className="alert alert-info mb-0">
                Ninguna serie coincide con los filtros.
            </div>
        )
    }

    return (
        <section className="contenedor-tarjetas row d-flex justify-content-around gap-3">
            {iniciativas.map((iniciativa) => (
                <TarjetaIniciativa key={iniciativa.id} iniciativa={iniciativa} />
            ))}
        </section>
    )
}

export default ListaIniciativas