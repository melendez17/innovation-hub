// app.js
// Arma la aplicación de Express: middlewares, rutas y manejo de errores, en ese orden.

import express from 'express'
import cors from 'cors'
import { config } from './config/env.js'
import { iniciativasRouter } from './iniciativas/inicitivas.routes.js'
import { usuariosRouter } from './usuarios/usuarios.routes.js'
import { sesionesRouter } from './sesiones/sesiones.routes.js'
import { competenciasRouter } from './competencias/competencias.routes.js'
import { rutaNoEncontrada, manejarErrores } from './middlewares/errores.js'
 
export const app = express()
 
app.use(cors({ origin: config.origenCliente }))  // solo el cliente React puede llamar
app.use(express.json())  // convierte el cuerpo JSON en req.body
 
// Aquí se montarán las rutas de cada módulo
app.use('/api/iniciativas', iniciativasRouter)
app.use('/api/usuarios', usuariosRouter)
app.use('/api/sesiones', sesionesRouter)
app.use('/api/competencias', competenciasRouter)

app.use(rutaNoEncontrada)  // si ninguna ruta respondió
app.use(manejarErrores)  // siempre el último
