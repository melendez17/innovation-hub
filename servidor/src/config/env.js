// config/env.js
// Lee la configuración de las variables de entorno y avisa si falta alguna.

// config/env.js
// Lee la configuración de las variables de entorno y avisa si falta alguna.
 
const requeridas = ['MONGODB_URI', 'DB_NAME', 'CLIENT_ORIGIN']
 
for (const nombre of requeridas) {
  if (!process.env[nombre]) {
    throw new Error(`Falta la variable de entorno ${nombre}`)
  }
}
 
export const config = {
  puerto: Number(process.env.PORT) || 3000,
  mongoUri: process.env.MONGODB_URI,
  nombreBd: process.env.DB_NAME,
  origenCliente: process.env.CLIENT_ORIGIN,
}
