//querySelectors
const contenedorTarjetas = document.querySelector(".contenedor-tarjetas");
const buscador = document.getElementById("buscar");
const contenedorFiltrosActivos = document.getElementById("contenedor-filtros-activos");
const categorias = document.querySelectorAll(".categoria");
const tipos = document.querySelectorAll(".tipo");
const competencias = document.querySelectorAll(".competencia");

//iniciativas
let iniciativas;
let categoriasSeleccionadas = [];
let tiposSeleccionados = [];
let competenciasSeleccionadas = [];

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

const idCompetencias = new Map();
idCompetencias.set("Programación web", "web");
idCompetencias.set("Diseño de base de datos", "base-datos");
idCompetencias.set("Desarrollo de APIs", "api");
idCompetencias.set("Análisis de requisitos", "requisitos");
idCompetencias.set("Diseño de UI", "ui");
idCompetencias.set("Control de versiones", "versiones");
idCompetencias.set("Pruebas de software", "pruebas");



//Bootstrap tooltip
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

//funciones
async function cargarTarjetas() {
    const iniciativasLocalStorage = localStorage.getItem("iniciativas");

    if (iniciativasLocalStorage) {
        iniciativas = JSON.parse(iniciativasLocalStorage);
    } else {
        try {
            const response = await fetch("../datos/iniciativas.json");
            if (!response.ok) {
                throw new Error("Error al obtener las iniciativas");
            }

            iniciativas = await response.json();
            
            localStorage.setItem("iniciativas", JSON.stringify(iniciativas));
        } catch (error) {
            console.log(error);
        }
    }

    mostrarTarjetas(iniciativas);
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
        if (iniciativa.visibilidad == "Privada"){
            return;
        }

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

        const coincideTipo =
            tiposSeleccionados.length === 0 || tiposSeleccionados.includes(iniciativa.tipo);

        const coincideCompetencia =
            competenciasSeleccionadas.length === 0 || iniciativa.competencias.some(competencia => competenciasSeleccionadas.includes(competencia));

        return resultadoBusqueda && coincideCategoria && coincideTipo && coincideCompetencia;
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
                <button type="button" class="btn-close p-0 top-50 translate-middle" data-bs-dismiss="alert" aria-label="Cancelar filtro"></button>
            `
            contenedorFiltrosActivos.appendChild(filtroActivo);

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

tipos.forEach(tipo => {
    tipo.addEventListener("click", () => {
        if (!tipo.classList.contains("activo")) {
            tiposSeleccionados.push(tipo.textContent);
            tipo.classList.add("activo");

            const filtroActivo = document.createElement("div");
            filtroActivo.className = "alert alert-warning alert-dismissible fade show col-5 col-sm-3 col-md-2 p-1 m-1 d-flex gap-1 justify-content-between justify-content-md-evenly align-items-center categoriaActiva"
            filtroActivo.innerHTML = `
                <p class="lh-1 m-0 pe-3">${tipo.textContent}</p>
                <button type="button" class="btn-close p-0 top-50 translate-middle" data-bs-dismiss="alert" aria-label="Cancelar filtro"></button>
            `
            contenedorFiltrosActivos.appendChild(filtroActivo);

            filtroActivo.querySelector(".btn-close").addEventListener("click", () => {
                console.log("corre evento");
                const indexTipo = tiposSeleccionados.indexOf(tipo.textContent);
                tiposSeleccionados.splice(indexTipo, 1);
                const idTipo = tipo.textContent.toLocaleLowerCase().trim();
                document.getElementById(idTipo).classList.remove("activo");
                filtarIniciativas();
            })


            filtarIniciativas();
        }
    })
})

competencias.forEach(competencia => {
    competencia.addEventListener("click", () => {
        if (!competencia.classList.contains("activo")) {
            competenciasSeleccionadas.push(competencia.textContent);
            competencia.classList.add("activo");

            const filtroActivo = document.createElement("div");
            filtroActivo.className = "alert alert-success alert-dismissible fade show col-5 col-sm-3 col-md-2 p-1 m-1 d-flex gap-1 justify-content-between justify-content-md-evenly align-items-center categoriaActiva"
            filtroActivo.innerHTML = `
                <p class="lh-1 m-0 pe-3">${competencia.textContent}</p>
                <button type="button" class="btn-close p-0 top-50 translate-middle" data-bs-dismiss="alert" aria-label="Cancelar filtro"></button>
            `
            contenedorFiltrosActivos.appendChild(filtroActivo);

            filtroActivo.querySelector(".btn-close").addEventListener("click", () => {
                console.log("corre evento");
                const indexComp = competenciasSeleccionadas.indexOf(competencia.textContent);
                competenciasSeleccionadas.splice(indexComp, 1);
                const idComp = idCompetencias.get(competencia.textContent.trim());
                document.getElementById(idComp).classList.remove("activo");
                filtarIniciativas();
            })


            filtarIniciativas();
        }
    })
})

buscador.addEventListener("input", () => {
    filtarIniciativas();
})

document.addEventListener('click', function (event) {
    const listaFiltros = document.getElementById('filtros');
    const listaCategorias = document.getElementById('categorias');
    const listaTipos = document.getElementById('tipos');
    const listaCompetencias = document.getElementById('competencias');
    const triggerFiltros = document.querySelector('[data-bs-target="#filtros"]');
    const triggerCategorias = document.querySelector('[data-bs-target="#categorias"]');
    const triggerTipos = document.querySelector('[data-bs-target="#tipos"]');
    const triggerCompetencias = document.querySelector('[data-bs-target="#competencias"]');

    // Check if the collapse is currently open
    const estaFiltrosAbierto = listaFiltros.classList.contains('show');
    const estaCategoriasAbierto = listaCategorias.classList.contains('show');
    const estaTiposAbierto = listaTipos.classList.contains('show');
    const estaCompetenciasAbierto = listaCompetencias.classList.contains('show');

    // If open, and the click was outside both the menu and the toggle button, close it
    if (estaFiltrosAbierto && !listaFiltros.contains(event.target) && !triggerFiltros.contains(event.target)) {
        const bsCollapse = bootstrap.Collapse.getOrCreateInstance(listaFiltros);
        bsCollapse.hide();
    }
    if (estaCategoriasAbierto && !listaCategorias.contains(event.target) && !triggerCategorias.contains(event.target)) {
        const bsCollapse = bootstrap.Collapse.getOrCreateInstance(listaTipos);
        bsCollapse.hide();
    }
    if (estaTiposAbierto && !listaTipos.contains(event.target) && !triggerTipos.contains(event.target)) {
        const bsCollapse = bootstrap.Collapse.getOrCreateInstance(listaTipos);
        bsCollapse.hide();
    }
    if (estaCompetenciasAbierto && !listaCompetencias.contains(event.target) && !triggerCompetencias.contains(event.target)) {
        const bsCollapse = bootstrap.Collapse.getOrCreateInstance(listaCompetencias);
        bsCollapse.hide();
    }
});



cargarTarjetas();
