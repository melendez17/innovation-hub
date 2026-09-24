const contenedor = document.querySelector(".contenerdor-tarjetas");
import iniciativas from '../datos/iniciativas.json' with {type: 'json'};

console.log(iniciativas);

function mostrarTarjetas(iniciativas) {
    contenedor.innerHTML = "";

    iniciativas.forEach(iniciativa => {
        const tarjeta = document.createElement("article");

        tarjeta.className = "col-4"
        tarjeta.innerHTML = `
            <h3>${iniciativa.titulo}</h3>
        `

        contenedor.appendChild(tarjeta);
    });
}

mostrarTarjetas(iniciativas);
