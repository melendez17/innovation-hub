import { Router } from 'express'
import * as controlador from './usuarios.controller.js'
import { requiereSesion } from '../middlewares/autenticacion.js'

export const usuariosRouter = Router()

usuariosRouter.get('/', controlador.listar)
usuariosRouter.get('/me', requiereSesion, controlador.consultarPropio)
usuariosRouter.post('/', controlador.crear)
