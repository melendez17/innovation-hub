const contenedor = document.querySelector(".contenedor-tarjetas");
let iniciativas;
const buscador = document.getElementById("buscar");
const contenedorCategoriasActivas = document.getElementById("contenedor-filtros-activos");
const categorias = document.querySelectorAll(".categoria");
const listaCategorias = document.querySelector(".filtro-categorias");
let categoriasActivas = [];
let categoriasSeleccionadas = [];
const idCategorias = new Map();
idCategorias.set("Tecnología", "tecnologia");
idCategorias.set("Educación", "educacion");
idCategorias.set("Sostenibilidad", "sostenibilidad");
idCategorias.set("Impacto Social", "social");
idCategorias.set("Negocios y Emprendimiento", "negocios");
idCategorias.set("Salud y Bienestar", "salud");
idCategorias.set("Cultura y Creatividad", "cultura");
idCategorias.set("Otros", "otros");

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
    contenedor.innerHTML = "";

    iniciativas.forEach(iniciativa => {
        const tarjeta = document.createElement("article");
        const competenciasHTML = (iniciativa.competencias || [])
            .slice(0, 3)
            .map(competencia => `<p>${competencia}</p>`)
            .join("");

        tarjeta.className = "col-11 tarjeta-iniciativa d-flex flex-column gap-1"
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
        `

        contenedor.appendChild(tarjeta);
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

    mostrarTarjetas(iniciativasFiltradas);
}

categorias.forEach(categoria => {
    categoria.addEventListener("click", () => {
        if (!categoria.classList.contains("activo")) {
            categoriasSeleccionadas.push(categoria.textContent);
            categoria.classList.add("activo");

            const filtroActivo = document.createElement("div");
            filtroActivo.className = "alert alert-primary alert-dismissible fade show col-5 p-1 m-0 d-flex gap-1 justify-content-between align-items-center categoriaActiva"
            filtroActivo.innerHTML = `
                <p class="lh-1 m-0">${categoria.textContent}</p>
                <button type="button" class="btn-close p-0 top-50 translate-middle" data-bs-dismiss="alert" aria-label="Close"></button>
            `
            contenedorCategoriasActivas.appendChild(filtroActivo);

            categoriasActivas = document.querySelectorAll(".categoriaActiva");
            botonEventListener();


            filtarIniciativas();
        }
    })
})

buscador.addEventListener("input", () => {
    filtarIniciativas();
})

function botonEventListener() {
    categoriasActivas.forEach(categoria => {
        categoria.querySelector(".btn-close").addEventListener("click", () => {
            console.log("corre evento");
            const indexCat = categoriasSeleccionadas.indexOf(categoria.textContent);
            categoriasSeleccionadas.splice(indexCat, 1);
            const idCat = idCategorias.get(categoria.textContent.trim());
            document.getElementById(idCat).classList.remove("activo");
            filtarIniciativas();
        })
    })
}

cargarTarjetas();
