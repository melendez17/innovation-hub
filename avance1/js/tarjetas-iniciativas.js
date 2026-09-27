//querySelectors
const contenedorTarjetas = document.querySelector(".contenedor-tarjetas");
const buscador = document.getElementById("buscar");
const contenedorCategoriasActivas = document.getElementById("contenedor-filtros-activos");
const categorias = document.querySelectorAll(".categoria");
const listaCategorias = document.querySelector(".filtro-categorias");

//iniciativas
let iniciativas;
let categoriasActivas = [];
let categoriasSeleccionadas = [];

//mapa para ids
const idCategorias = new Map();
idCategorias.set("Tecnología", "tecnologia");
idCategorias.set("Educación", "educacion");
idCategorias.set("Sostenibilidad", "sostenibilidad");
idCategorias.set("Impacto Social", "social");
idCategorias.set("Negocios y Emprendimiento", "negocios");
idCategorias.set("Salud y Bienestar", "salud");
idCategorias.set("Cultura y Creatividad", "cultura");
idCategorias.set("Otros", "otros");

//Bootstrap tooltip
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

async function cargarTarjetas() {
    try {
        const response = await fetch("../datos/iniciativas.json");
        if (!response.ok) {
            throw new Error("Error al obtener las iniciativas");
        }

        iniciativas = await response.json();
        console.log(iniciativas);
        mostrarTarjetas(iniciativas);
    } catch (error) {
        console.log(error);
    }

}

function mostrarTarjetas(iniciativas) {
    contenedorTarjetas.innerHTML = "";

    
    if (iniciativas.length === 0) {
        const mensajeSinResultados = document.createElement("p");
        mensajeSinResultados.className = "col-11 text-center fs-1 mensaje-sin-resultados";
        mensajeSinResultados.innerHTML = `No se han encontrado iniciativas`;
        
        contenedorTarjetas.appendChild(mensajeSinResultados);
        return;
    }

    iniciativas.forEach(iniciativa => {
        const tarjeta = document.createElement("article");
        const competenciasHTML = (iniciativa.competencias || [])
            .slice(0, 3)
            .map(competencia => `<p>${competencia}</p>`)
            .join("");

        tarjeta.className = "col-11 col-sm-5 col-lg-3 p-2 tarjeta-iniciativa d-flex flex-column gap-1 justify-content-between"
        tarjeta.innerHTML = `
                <div class="d-flex justify-content-between gap-3 encabezado-tarjeta">
                    <h3>${iniciativa.titulo}</h3>
                    <p>${iniciativa.tipo}</p>
                </div>
                <div class="resumen">
                    <p>${iniciativa.resumen}</p>
                </div>
                <div class="categoria d-flex justify-content-between">
                    <p class="etiqueta">Categoria: </p>
                    <p>${iniciativa.categoria}</p>
                </div>
                <div class="propietario d-flex justify-content-between">
                    <p class="etiqueta">Propietario: </p>
                    <p>${iniciativa.propietario}</p>
                </div>
                <div class="estado d-flex justify-content-between">
                    <p class="etiqueta">Estado:</p>
                    <p>${iniciativa.estado}</p>
                </div>
                <div class="competencias d-flex flex-column">
                    <p class="etiqueta">Competencias Requeridas: </p>
                    ${competenciasHTML}
                </div>
                <a role="button" class="btn btn-primary btn-detalles-iniciativa" href="./detalles-iniciativa.html">Detalles</a>
        `
        contenedorTarjetas.appendChild(tarjeta);
        tarjeta.querySelector(".btn-detalles-iniciativa").addEventListener("click", () => {
            localStorage.setItem("idIniciativa", iniciativa.id);
        })
    });
}

function filtarIniciativas() {
    const texto = buscador.value.toLowerCase().trim();

    const iniciativasFiltradas = iniciativas.filter(iniciativa => {
        const resultadoBusqueda = iniciativa.titulo.toLowerCase().includes(texto);

        const coincideCategoria =
            categoriasSeleccionadas.length === 0 || categoriasSeleccionadas.includes(iniciativa.categoria);

        return resultadoBusqueda && coincideCategoria;
    })

    console.log(categoriasSeleccionadas)
    mostrarTarjetas(iniciativasFiltradas);
}

categorias.forEach(categoria => {
    categoria.addEventListener("click", () => {
        if (!categoria.classList.contains("activo")) {
            categoriasSeleccionadas.push(categoria.textContent);
            categoria.classList.add("activo");

            const filtroActivo = document.createElement("div");
            filtroActivo.className = "alert alert-primary alert-dismissible fade show col-5 col-sm-3 col-md-2 p-1 m-1 d-flex gap-1 justify-content-between justify-content-md-evenly align-items-center categoriaActiva"
            filtroActivo.innerHTML = `
                <p class="lh-1 m-0 pe-3">${categoria.textContent}</p>
                <button type="button" class="btn-close p-0 top-50 translate-middle" data-bs-dismiss="alert" aria-label="Close"></button>
            `
            contenedorCategoriasActivas.appendChild(filtroActivo);

            filtroActivo.querySelector(".btn-close").addEventListener("click", () => {
                console.log("corre evento");
                const indexCat = categoriasSeleccionadas.indexOf(categoria.textContent);
                categoriasSeleccionadas.splice(indexCat, 1);
                const idCat = idCategorias.get(categoria.textContent.trim());
                document.getElementById(idCat).classList.remove("activo");
                filtarIniciativas();
            })


            filtarIniciativas();
        }
    })
})

buscador.addEventListener("input", () => {
    filtarIniciativas();
})



cargarTarjetas();
