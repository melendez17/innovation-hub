// series/series.validacion.js
// Revisa los datos que llegan del cliente. Devuelve un mensaje por campo con problema.
// Si todo está bien, devuelve un objeto vacío: {}

import { ObjectId } from 'mongodb'

export const TIPOS = ['Reto', 'Idea', 'Necesidad']
export const CATEGORIAS = ['Tecnología', 'Educación', 'Sostenibilidad', 'Impacto Social', 'Negocios y Emprendimiento', 'Salud y Bienestar', 'Cultura y Creatividad', 'Otros']
export const ESTADOS = ['Borrador', 'Publicada', 'En formación de equipo', 'Convertida en proyecto', 'Archivada']
export const VISIBILIDADES = ['Pública', 'Institucional', 'Restringida', 'Privada']

export function validarIniciativa(datos) {
    const errores = {}

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

    if (typeof datos.problema !== 'string' || datos.problema.trim().length < 2) {
        errores.problema = 'Describa el problema que resulve la iniciativa con al menos 2 caracteres.'
    }

    if (typeof datos.beneficiados !== 'string' || datos.beneficiados.trim().length < 2) {
        errores.beneficiados = 'Escriba los beneficiados de la iniciativa con al menos 2 caracteres.'
    }

    if (!CATEGORIAS.includes(datos.categoria)) {
        errores.categoria = 'Elija una categoría de la lista.'
    }

    datos.competencias.forEach(competencia => {
        if (typeof competencia !== 'string' || !ObjectId.isValid(competencia)) {
            errores.competencia = 'Seleccione una competencia válida'
        }
    });

    const cantidadIntegrantes = datos.cantidadIntegrantes
    if (!Number.isInteger(cantidadIntegrantes) || cantidadIntegrantes < 2 || cantidadIntegrantes > 30) {
        errores.temporadas = 'Indique un número entero entre 2 y 30.'
    }

    if (!VISIBILIDADES.includes(datos.visibilidad)) {
        errores.visibilidad = 'Elija una visibilidad de la lista.'
    }

    return errores
}
