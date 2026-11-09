import { Router } from 'express'
import * as controlador from './solicitudes.controller.js'
import { requiereSesion } from '../middlewares/autenticacion.js'

export const solicitudesRouter = Router()

solicitudesRouter.get('/', requiereSesion, controlador.listarPropias)
solicitudesRouter.get('/:id', requiereSesion, controlador.buscar)
solicitudesRouter.put('/:id', requiereSesion, controlador.modificar)
solicitudesRouter.post('/:id/cancelacion', requiereSesion, controlador.cancelar)
