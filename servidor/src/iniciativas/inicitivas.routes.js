import { Router } from 'express'
import * as controlador from './iniciativas.controller.js'
import { requiereSesion, sesionOpcional } from '../middlewares/autenticacion.js'
import { crear as crearSolicitud, listarRecibidas } from '../solicitudes/solicitudes.controller.js'
import { listar as listarEquipo, retirar } from '../equipo/equipo.controller.js'
import { crear as crearProyecto } from '../proyectos/proyectos.controller.js'

export const iniciativasRouter = Router()

iniciativasRouter.get('/', sesionOpcional, controlador.listar)
iniciativasRouter.get("/:id", sesionOpcional, controlador.buscar)
iniciativasRouter.post('/', requiereSesion, controlador.crear)
iniciativasRouter.post('/:id/publicacion', requiereSesion, controlador.publicar)
iniciativasRouter.post('/:id/proyecto', requiereSesion, crearProyecto)
iniciativasRouter.post('/:id/solicitudes', requiereSesion, crearSolicitud)
iniciativasRouter.get('/:id/solicitudes', requiereSesion, listarRecibidas)
iniciativasRouter.get('/:id/miembros', sesionOpcional, listarEquipo)
iniciativasRouter.post('/:id/miembros/:usuarioId/retiro', requiereSesion, retirar)
iniciativasRouter.put('/:id', requiereSesion, controlador.modificar)
iniciativasRouter.delete('/:id', requiereSesion, controlador.eliminar)
