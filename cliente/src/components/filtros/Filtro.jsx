function Filtro({nombre, opciones, onCambiar}) {
    return (
        <div className="col-sm-3 p-0 d-flex">
            <label htmlFor="filtro-estado" className="form-label mb-0 me-1 align-self-center">{nombre}</label>
            <select
                id="filtro-estado"
                className="form-select"
                value={nombre}
                onChange={(event) => onCambiar(event.target.value)}
            >
                <option value="Todos">Todos</option>
                {opciones.map((opcion) => (
                    <option key={opcion} value={opcion}>{opcion}</option>
                ))}
            </select>
        </div>
    )
}

export default Filtro