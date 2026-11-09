import { ObjectId } from 'mongodb'

export const TIPOS = ['Reto', 'Idea', 'Necesidad']
export const CATEGORIAS = ['Tecnología', 'Educación', 'Sostenibilidad', 'Impacto social', 'Negocios y emprendimiento', 'Salud y bienestar', 'Cultura y creatividad', 'Otro']
export const ESTADOS = ['Borrador', 'Publicada', 'En formación de equipo', 'Convertida en proyecto', 'Archivada']
export const VISIBILIDADES = ['Pública', 'Institucional', 'Restringida', 'Privada']

export function validarIniciativa(datos) {
    const errores = {}
    if (datos === null || typeof datos !== 'object' || Array.isArray(datos)) {
        return { cuerpo: 'Envíe un objeto con los datos de la iniciativa.' }
    }

    if (typeof datos.titulo !== 'string' || datos.titulo.trim().length < 2) {
        errores.titulo = 'Escriba un título de al menos 2 caracteres.'
    }

    if (!TIPOS.includes(datos.tipo)) {
        errores.tipo = 'Elija un tipo de la lista.'
    }

    if (typeof datos.resumen !== 'string' || datos.resumen.trim().length < 2) {
        errores.resumen = 'Escriba un resumen de al menos 2 caracteres.'
    }

    if (typeof datos.descripcion !== 'string' || datos.descripcion.trim().length < 2) {
        errores.descripcion = 'Escriba una descripcion detallada de al menos 2 caracteres.'
    }

    if (datos.problema != null && typeof datos.problema !== 'string') {
        errores.problema = 'Escriba el problema como texto.'
    }

    if (datos.beneficiados != null && typeof datos.beneficiados !== 'string') {
        errores.beneficiados = 'Escriba los beneficiarios como texto.'
    }

    if (!CATEGORIAS.includes(datos.categoria)) {
        errores.categoria = 'Elija una categoría de la lista.'
    }

    if (datos.competencias !== undefined) {
        if (!Array.isArray(datos.competencias)) {
            errores.competencias = 'Envíe una lista de competencias.'
        } else if (datos.competencias.some(competencia => typeof competencia !== 'string' || !ObjectId.isValid(competencia))) {
            errores.competencias = 'Seleccione competencias válidas.'
        }
    }

    if (datos.etiquetas !== undefined &&
        (!Array.isArray(datos.etiquetas) || datos.etiquetas.some(etiqueta => typeof etiqueta !== 'string' || !etiqueta.trim()))) {
        errores.etiquetas = 'Envíe una lista de etiquetas de texto no vacías.'
    }

    const cantidadIntegrantes = datos.cantidadIntegrantes
    if (!Number.isInteger(cantidadIntegrantes) || cantidadIntegrantes < 1) {
        errores.cantidadIntegrantes = 'Indique un número entero mayor que cero.'
    }

    if (!VISIBILIDADES.includes(datos.visibilidad)) {
        errores.visibilidad = 'Elija una visibilidad de la lista.'
    }

    return errores
}
