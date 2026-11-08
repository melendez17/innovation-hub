import Filtro from './Filtro.jsx'

function BarraBusqueda({children }) {
    return (

        <div className="card-body">
            <div className='row p-0 d-flex flex-column align-items-center mb-3 position-relative mx-3 g-3'>
                <form className="col-12 filtros-iniciativas p-0" role="search">
                    <input id="buscar" className="form-control me-2" type="search" placeholder="Buscar..."
                        aria-label="Buscar" />
                </form>
                <div className='col-12 d-flex justify-content-between p-0'>
                    {children}
                </div>
                
            </div>
        </div>
    )
}

export default BarraBusqueda