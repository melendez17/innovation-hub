import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb, faCircleUser} from '@fortawesome/free-solid-svg-icons';

function Encabezado() {
    return (
        <header>
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
                <div className="container-fluid px-5">
                    <a className="navbar-brand fw-bold fs-4" href="index.html">
                        <FontAwesomeIcon icon={faLightbulb} className='me-2' />Innovation Hub
                    </a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item"><a className="nav-link active fw-semibold" href="index.html">Inicio</a></li>
                            <li className="nav-item"><a className="nav-link" href="paginas/catalogo.html">Iniciativas</a></li>
                            <li className="nav-item"><a className="nav-link" href="paginas/nueva-iniciativa.html">Publicar</a></li>
                            <li className="nav-item position-relative btn-user">
                                <a className="d-lg-none nav-link" href="/innovation-hub/avance1/paginas/perfil.html">Mi
                                    Perfil</a>
                                <a href="paginas/perfil.html"><button type="button"
                                    className="btn btn-user d-none d-lg-inline text-white"
                                    aria-label="Opciones de usuario" data-bs-toggle="collapse"
                                    data-bs-target="#login-opciones"><FontAwesomeIcon icon={faCircleUser} size='xl'/></button></a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    )
}

export default Encabezado