import { Router } from 'express'
import * as controlador from './usuarios.controller.js'
import { requiereSesion } from '../middlewares/autenticacion.js'

export const usuariosRouter = Router()

usuariosRouter.get('/', requiereSesion, controlador.listar)
usuariosRouter.get('/me', requiereSesion, controlador.consultarPropio)
usuariosRouter.put('/me', requiereSesion, controlador.modificarPropio)
usuariosRouter.get('/:id', requiereSesion, controlador.consultarPublico)
usuariosRouter.post('/', controlador.crear)
