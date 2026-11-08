import * as repositorio from './competencias.repository.js'
 
export async function listar() {
  return repositorio.listar()
}