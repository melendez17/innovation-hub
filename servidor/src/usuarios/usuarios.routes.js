import { Router } from 'express'
import * as controlador from './usuarios.controller.js'

export const usuariosRouter = Router()

usuariosRouter.get('/', controlador.listar)