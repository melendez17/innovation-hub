// utils/revisarId.js
// Comprueba que un texto tenga el formato de un ObjectId antes de usarlo.
 
import { ObjectId } from 'mongodb'
import { HttpError } from './HttpError.js'
 
export function revisarId(id) {
  if (!ObjectId.isValid(id)) {
    throw new HttpError(400, 'ID_INVALIDO', 'El identificador no es válido.')
  }
}
