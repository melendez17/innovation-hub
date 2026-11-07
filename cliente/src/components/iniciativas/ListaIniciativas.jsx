import TarjetaIniciativa from "./TarjetaIniciativa"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb } from '@fortawesome/free-regular-svg-icons';

function ListaIniciativas({ iniciativas, usuarioActivo }) {
    if (!iniciativas || iniciativas.length === 0) {
        return (
            <div className="alert alert-info mb-0">
                Ninguna serie coincide con los filtros.
            </div>
        )
    }

    console.log(iniciativas)

    return (
        <section className="contenedor-tarjetas row d-flex justify-content-around gap-3">
            <button className="col-11 btn btn-outline-primary position-relative p-0" type="button">
                <FontAwesomeIcon icon={faLightbulb} className='me-2' />
                Crear una Iniciativa
            </button>

            {iniciativas.map((iniciativa) => (
                <TarjetaIniciativa key={iniciativa.id} iniciativa={iniciativa} usuarioActivo={usuarioActivo} />
            ))}
        </section>
    )
}

export default ListaIniciativas