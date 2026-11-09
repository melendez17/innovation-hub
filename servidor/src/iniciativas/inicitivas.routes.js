import { Router } from 'express'
import * as controlador from './iniciativas.controller.js'
import { requiereSesion } from '../middlewares/autenticacion.js'

export const iniciativasRouter = Router()

iniciativasRouter.get('/', controlador.listar)
iniciativasRouter.get("/:id", controlador.buscar)
iniciativasRouter.post('/', requiereSesion, controlador.crear)
iniciativasRouter.patch('/:id/nuevoMiembro', controlador.agregarMiembro)
iniciativasRouter.delete('/:id', controlador.eliminar)
