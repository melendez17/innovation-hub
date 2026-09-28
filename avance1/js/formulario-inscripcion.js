const titulo = document.getElementById("titulo");


async function cargarIniciativa(id) {
    try {
        iniciativas = JSON.parse(localStorage.getItem("iniciativas"));
        console.log("iniciativas " + iniciativas);
        console.log("id local storage: " + localStorage.getItem("idIniciativa"))
        iniciativa = iniciativas.find(iniciativa => iniciativa.id == id);
        console.log("iniciativa cargada " + iniciativa);

        if (!iniciativa) {
            throw new Error("No se encontró ninguna iniciativa con el id", id);
        } else {
            titulo.textContent = iniciativa.titulo;
        }
    } catch (error) {
        console.error(error);
    }
}

cargarIniciativa(localStorage.getItem("idIniciativa"));