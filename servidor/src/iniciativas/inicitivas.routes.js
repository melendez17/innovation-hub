import { Router } from 'express'
import * as controlador from './iniciativas.controller.js'

export const iniciativasRouter = Router()

iniciativasRouter.get('/', controlador.listar)
iniciativasRouter.get("/:id", controlador.buscar)
iniciativasRouter.post('/', controlador.crear)
iniciativasRouter.patch('/:id/nuevoMiembro', controlador.agregarMiembro)
iniciativasRouter.delete('/:id', controlador.eliminar)