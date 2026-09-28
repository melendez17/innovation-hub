//querySelectors
const titulo = document.getElementById("titulo");
const propietario = document.getElementById("propietario");
const descripcion = document.getElementById("descripcion");
const miembros = document.getElementById("miembros");
const tipo = document.getElementById("tipo");
const categoria = document.getElementById("categoria");
const estado = document.getElementById("estado");
const visibilidad = document.getElementById("visibilidad");
const competencias = document.getElementById("competencias");
const btnEliminar = document.getElementById("eliminar");
const btnEditar = document.getElementById("editar");

//iniciativa
let iniciativas;
let iniciativa;

//Bootstrap tooltip
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

//modal
const modalEliminar = new bootstrap.Modal(document.getElementById("modalConfirmarEliminar"));
const btnConfirmarEliminar = document.getElementById("btnConfirmarEliminar");

async function cargarIniciativa(id) {
    try {
        // const response = await fetch("../datos/iniciativas.json");
        // if (!response.ok) {
        //     throw new Error("Error al obtener las iniciativas");
        // }

        iniciativas = JSON.parse(localStorage.getItem("iniciativas"));
        console.log("iniciativas " + iniciativas);
        console.log("id local storage: " + localStorage.getItem("idIniciativa"))
        iniciativa = iniciativas.find(iniciativa => iniciativa.id == id);
        console.log("iniciativa cargada " + iniciativa);

        if (!iniciativa) {
            throw new Error("No se encontró ninguna iniciativa con el id", id);
        } else {
            switch(iniciativa.visibilidad){
                case "Pública":
                    mostrarPublica(iniciativa);
                    break;
                
                case "Institucional":
                    mostrarInstitucional(iniciativa);
                    break;

                case "Restringida":
                    mostrarRestringida(iniciativa);
                    break;

                case "Privada":
                    mostrarPrivada(iniciativa);
                    break;
            }
        }
    } catch (error) {
        console.error(error);
    }
}

function mostrarPublica(iniciativa){
    titulo.textContent = iniciativa.titulo;
    propietario.textContent = iniciativa.propietario;
    descripcion.textContent = iniciativa.descripcion;
    const competenciasHTML = (iniciativa.competencias || []).map(competencia => `<p class="card m-0 p-1 d-flex flex-row align-items-center gap-1 tarjeta-competencia"><i class="fa-solid fa-check fa-sm"></i><span>${competencia}<span></p>`).join("");
    competencias.innerHTML = `${competenciasHTML}`;
    tipo.textContent = iniciativa.tipo;
    categoria.textContent = iniciativa.categoria;
    estado.textContent = iniciativa.estado;
    visibilidad.textContent = iniciativa.visibilidad;
    const miembrosHTML = (iniciativa.miembros || []).map(miembro => `<p class="card m-0 p-1 d-flex flex-row align-items-center gap-1 tarjeta-miembro"><i class="fa-regular fa-user fa-xs" aria-hidden=true></i><span>${miembro}</></p>`).join("");
    miembros.innerHTML = `${miembrosHTML}`;
}

function mostrarInstitucional(iniciativa){
    titulo.textContent = iniciativa.titulo;
    propietario.textContent = iniciativa.propietario;
    descripcion.textContent = iniciativa.descripcion;
    const competenciasHTML = (iniciativa.competencias || []).map(competencia => `<p class="card m-0 p-1 d-flex flex-row align-items-center gap-1 tarjeta-competencia"><i class="fa-solid fa-check fa-sm"></i><span>${competencia}<span></p>`).join("");
    competencias.innerHTML = `${competenciasHTML}`;
    tipo.textContent = iniciativa.tipo;
    categoria.textContent = iniciativa.categoria;
    estado.textContent = iniciativa.estado;
    visibilidad.textContent = iniciativa.visibilidad;
    const miembrosHTML = (iniciativa.miembros || []).map(miembro => `<p class="card m-0 p-1 d-flex flex-row align-items-center gap-1 tarjeta-miembro"><i class="fa-regular fa-user fa-xs" aria-hidden=true></i><span>${miembro}</></p>`).join("");
    miembros.innerHTML = `${miembrosHTML}`;
}

function mostrarRestringida(iniciativa) {
    titulo.textContent = iniciativa.titulo;
    propietario.textContent = iniciativa.propietario;
    descripcion.textContent = iniciativa.resumen;
    const competenciasHTML = (iniciativa.competencias || []).map(competencia => `<p class="card m-0 p-1 d-flex flex-row align-items-center gap-1 tarjeta-competencia"><i class="fa-solid fa-check fa-sm"></i><span>${competencia}<span></p>`).join("");
    competencias.innerHTML = `${competenciasHTML}`;
    tipo.textContent = iniciativa.tipo;
    categoria.textContent = iniciativa.categoria;
    estado.textContent = iniciativa.estado;
    visibilidad.textContent = iniciativa.visibilidad;
    miembros.parentElement.classList.add("d-none");
}

function mostrarPrivada(iniciativa){

}

document.addEventListener('click', function (event) {
    const opciones = document.getElementById('opciones');
    const triggerOpciones = document.querySelector('[data-bs-target="#opciones"]');

    
    // Check if the collapse is currently open
    const estaOpcionesAbierto = opciones.classList.contains('show');

    
    // If open, and the click was outside both the menu and the toggle button, close it
    if (estaOpcionesAbierto && !opciones.contains(event.target) && !triggerOpciones.contains(event.target)) {
        const bsCollapse = bootstrap.Collapse.getOrCreateInstance(opciones);
        bsCollapse.hide();
    }
});

function borrarIniciativa(id) {
    iniciativas.splice(id, 1);
    console.log(iniciativas);
    localStorage.setItem("iniciativas", JSON.stringify(iniciativas))
    window.location.href = "./catalogo.html";
}

btnConfirmarEliminar.addEventListener("click", () => {
    borrarIniciativa(localStorage.getItem("idIniciativa"));
    modalEliminar.hide();
});

btnEliminar.addEventListener("click", () => {
    modalEliminar.show()
})

// Evento para redirigir a editar-iniciativa.html
if (btnEditar) {
    btnEditar.addEventListener("click", () => {
        // Asegúrate de que idIniciativa o la variable del ID actual esté disponible
        const idActual = localStorage.getItem("idIniciativa");
        localStorage.setItem("idIniciativa", idActual); 
        window.location.href = "./editar-iniciativa.html";
    });
}

cargarIniciativa(localStorage.getItem("idIniciativa"));