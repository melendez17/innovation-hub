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
            const miembrosHTML = (iniciativa.miembros || []).map(miembro => `<p>${miembro}</p>`).join("");
            miembros.innerHTML = `${miembrosHTML}`;
            tipo.textContent = iniciativa.tipo;
            categoria.textContent = iniciativa.categoria;
            estado.textContent = iniciativa.estado;
            visibilidad.textContent = iniciativa.visibilidad;
            const competenciasHTML = (iniciativa.competencias || []).map(competencia => `<p>${competencia}</p>`).join("");
            competencias.innerHTML = `${competenciasHTML}`;
        }
    } catch(error){
        console.error(error);
    }
}

cargarIniciativa(localStorage.getItem("idIniciativa"));