import { Router } from 'express'
import * as controlador from './iniciativas.controller.js'
import { requiereSesion, sesionOpcional } from '../middlewares/autenticacion.js'

export const iniciativasRouter = Router()

iniciativasRouter.get('/', sesionOpcional, controlador.listar)
iniciativasRouter.get("/:id", sesionOpcional, controlador.buscar)
iniciativasRouter.post('/', requiereSesion, controlador.crear)
iniciativasRouter.put('/:id', requiereSesion, controlador.modificar)
iniciativasRouter.delete('/:id', requiereSesion, controlador.eliminar)
