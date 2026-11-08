const URL_API = import.meta.env.VITE_API_URL


async function pedir(ruta) {
    let respuesta
    try {
        respuesta = await fetch(URL_API + ruta)
    } catch {
        throw new Error('No se pudo conectar con el API. ¿Está encendido el servidor?')
    }

    const cuerpo = await respuesta.json()
    if (!respuesta.ok){
        throw new Error(cuerpo.error.mensaje)
    }

    return cuerpo
}

export function obtenerIniciativas(){
    return pedir('/iniciativas')
}

export function obtenerUsuarios(){
    return pedir('/usuarios')
}
