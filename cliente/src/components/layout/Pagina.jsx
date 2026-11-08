import Encabezado from "./Encabezado";

function Pagina({ titulo, children }) {
    return (
        <>
            <Encabezado />
            <main className="container-fluid pb-5">
                <h1 className="text-center">{titulo}</h1>
                {children}
            </main>
        </>
    )
}

export default Pagina