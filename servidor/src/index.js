// index.js
// Punto de entrada: conecta la base de datos y después levanta el servidor.

import { config } from './config/env.js'
import { app } from './app.js'
 
app.listen(config.puerto, () => {
  console.log(`API escuchando en http://localhost:${config.puerto}`)
})
