import { Router } from 'express'
import * as controlador from './iniciativas.controller.js'

export const iniciativasRouter = Router()

iniciativasRouter.get('/', controlador.listar)