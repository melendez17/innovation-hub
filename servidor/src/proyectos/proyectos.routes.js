import { Router } from 'express'
import * as controlador from './proyectos.controller.js'
import { sesionOpcional } from '../middlewares/autenticacion.js'

export const proyectosRouter = Router()

proyectosRouter.get('/', sesionOpcional, controlador.listar)
proyectosRouter.get('/:id', sesionOpcional, controlador.buscar)
