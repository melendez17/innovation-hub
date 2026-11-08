import Pagina from "../components/layout/Pagina";
import DetalleIniciativa from "../components/iniciativas/DetalleIniciativa";
import { useParams } from "react-router-dom";

function Iniciativa(){
    const { id } = useParams()

    return(
        <Pagina>
            <DetalleIniciativa id={id} />
        </Pagina>
    )
}

export default Iniciativa