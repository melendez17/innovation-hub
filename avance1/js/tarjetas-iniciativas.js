const contenedor = document.querySelector(".contenerdor-tarjetas");
import iniciativas from '../datos/iniciativas.json' with {type: 'json'};

console.log(iniciativas);

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

mostrarTarjetas(iniciativas);
