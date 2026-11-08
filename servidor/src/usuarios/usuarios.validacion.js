import { ObjectId } from 'mongodb'

const TIPOS = ['Estudiante', 'Docente', 'Administrativo']

export function validarUsuario(datos) {
    const errores = {}

    if (typeof datos.nombre !== 'string' || datos.nombre.trim().length < 2) {
        errores.nombre = 'Escriba un nombre de al menos 2 caracteres.'
    }

    if (typeof datos.apellido1 !== 'string' || datos.apellido1.trim().length < 2) {
        errores.apellido1 = 'Escriba un apellido de al menos 2 caracteres.'
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof datos.email !== 'string' || !regexEmail.test(datos.email)) {
        errores.email = 'Escriba un email válido.'
    }

    if (typeof datos.password !== 'string' || datos.password.trim().length < 2) {
        errores.password = 'Escriba una contraseña de al menos 2 caracteres.'
    }

    if (!TIPOS.includes(datos.tipo)) {
        errores.tipo = 'Elija un tipo de usuario de la lista.'
    }

    if (typeof datos.carrera !== 'string' || datos.carrera.trim().length < 2) {
        errores.carrera = 'Escriba un nombre de carrera de al menos 2 caracteres.'
    }

    return errores
}