import { Router } from 'express'
import * as controlador from './sesiones.controller.js'
import { requiereSesion } from '../middlewares/autenticacion.js'

export const sesionesRouter = Router()

sesionesRouter.post('/', controlador.crear)
sesionesRouter.get('/actual', requiereSesion, controlador.consultarActual)
sesionesRouter.delete('/actual', requiereSesion, controlador.cerrarActual)
