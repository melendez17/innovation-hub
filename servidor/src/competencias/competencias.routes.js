import { Router } from 'express'
import * as controlador from './competencias.controller.js'

export const competenciasRouter = Router()

competenciasRouter.get('/', controlador.listar)