// app.js
// Arma la aplicación de Express: middlewares, rutas y manejo de errores, en ese orden.

import express from 'express'
import cors from 'cors'
import { config } from './config/env.js'
import { rutaNoEncontrada, manejarErrores } from './middlewares/errores.js'
 
export const app = express()
 
app.use(cors({ origin: config.origenCliente }))  // solo el cliente React puede llamar
app.use(express.json())  // convierte el cuerpo JSON en req.body
 
// Aquí se montarán las rutas de cada módulo (miembros, series)
 
app.use(rutaNoEncontrada)  // si ninguna ruta respondió
app.use(manejarErrores)  // siempre el último
