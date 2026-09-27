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

//iniciativa
let iniciativa;

//Bootstrap tooltip
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

async function cargarIniciativa(id) {
    try {
        const response = await fetch("../datos/iniciativas.json");
        if (!response.ok) {
            throw new Error("Error al obtener las iniciativas");
        }

        const iniciativas = await response.json();
        console.log("iniciativas " + iniciativas);
        console.log("id local storage: " + localStorage.getItem("idIniciativa"))
        iniciativa = iniciativas.find(iniciativa => iniciativa.id == id);
        console.log("iniciativa cargada "+ iniciativa);

        if (!iniciativa) {
            throw new Error("No se encontró ninguna iniciativa con el id", id);
        } else {
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
    } catch(error){
        console.error(error);
    }
}

cargarIniciativa(localStorage.getItem("idIniciativa"));