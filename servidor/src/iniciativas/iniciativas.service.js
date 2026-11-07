import * as repositorio from './iniciativas.repository.js'
 
export async function listar() {
  return repositorio.listar()
}