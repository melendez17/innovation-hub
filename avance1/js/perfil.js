//queryselectors
const nombre = document.getElementById("nombre");
const edad = document.getElementById("edad");
const nacionalidad = document.getElementById("nacionalidad");
const competencias = document.getElementById("competencias");
const intereses = document.getElementById("intereses");
const proyectos = document.getElementById("proyectos");

async function cargarIniciativa(correo) {
    try {
        const response = await fetch("../datos/usuarios.json");
        if (!response.ok) {
            throw new Error("Error al obtener las usuarios");
        }

        const usuarios = await response.json();
        const usuario = usuarios.find(usuario => usuario.correo == correo);

        if (!usuario) {
            throw new Error("No se encontró ninguna usuario con el id", id);
        } else {
            nombre.textContent = usuario.nombre;
            edad.textContent = usuario.edad;
            nacionalidad.textContent = usuario.nacionalidad;
            const competenciasHTML = (usuario.competencias || []).map(competencia => `<p class="card m-0 mt-1 p-1 d-flex flex-row align-items-center gap-3 tarjeta-perfil"><i class="fa-solid fa-check fa-sm"></i><span>${competencia}<span></p>`).join("");
            competencias.innerHTML = `${competenciasHTML}`;
            const interesesHTML = (usuario.intereses || []).map(interes => `<p class="card m-0 mt-1 p-1 d-flex flex-row align-items-center gap-3 tarjeta-perfil"><i class="fa-solid fa-brain"></i><span>${interes}<span></p>`).join("");
            intereses.innerHTML = `${interesesHTML}`;
            console.log(usuario.proyectos);
            const proyectosHTML = (usuario.proyectos || []).map(proyecto => `<p class="card m-0 mt-1 p-1 d-flex flex-row align-items-center gap-3 tarjeta-perfil"><i class="fa-regular fa-lightbulb"></i><span>${proyecto}<span></p>`).join("");
            proyectos.innerHTML = `${proyectosHTML}`;
        }
    } catch (error) {
        console.error(error);
    }
}


cargarIniciativa("rgonzalezca@ucenfotec.ac.cr");