import * as repositorio from './usuarios.repository.js'
 
export async function listar() {
  return repositorio.listar()
}