const URL_API = import.meta.env.VITE_API_URL


async function pedir(ruta, metodo = 'GET', datos) {
    const opciones = { method: metodo }
    if (datos !== undefined) {
        opciones.headers = { 'Content-Type': 'application/json' }
        opciones.body = JSON.stringify(datos)
    }

    let respuesta
    try {
        respuesta = await fetch(URL_API + ruta, opciones)
    } catch {
        throw new Error('No se pudo conectar con el API. ¿Está encendido el servidor?')
    }

    if (respuesta.status === 204) {
        return null
    }


    const cuerpo = await respuesta.json()
    if (!respuesta.ok) {
        const error = new Error(cuerpo.error.mensaje)
        error.detalles = cuerpo.error.detalles
        throw error
    }
    return cuerpo
}


export function obtenerIniciativas() {
    return pedir('/iniciativas')
}

export function obtenerIniciativaId(id) {
    return pedir('/iniciativas/' + id)
}

export function obtenerUsuarios() {
    return pedir('/usuarios')
}
