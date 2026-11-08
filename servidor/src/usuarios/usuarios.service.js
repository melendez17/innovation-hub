import * as repositorio from './usuarios.repository.js'
 
export async function listar() {
  return repositorio.listar()
}

export async function existe(id) {
  const usuario = await repositorio.buscarPorId(id)
  return usuario !== null
}