import Encabezado from "./Encabezado";

function Pagina({ titulo, children }) {
    return (
        <>
            <Encabezado />
            <main className="container-fluid pb-5">
                <h2 className="text-center">{titulo}</h2>
                {children}
            </main>
        </>
    )
}

export default Pagina