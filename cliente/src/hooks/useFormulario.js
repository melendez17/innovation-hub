import { useState } from 'react'

export function useFormulario(iniciales, validar, guardar) {
  const [datos, setDatos] = useState(iniciales)
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const cambiar = (campo, valor) => {
    setDatos((anterior) => ({ ...anterior, [campo]: valor }))
    setErrores((anterior) => ({ ...anterior, [campo]: undefined }))
    setMensaje('')
  }
  async function enviar(evento) {
    evento.preventDefault()
    if (ocupado) return
    const fallos = validar(datos)
    setErrores(fallos)
    setMensaje('')
    if (Object.values(fallos).some(Boolean)) return
    setOcupado(true)
    try {
      await guardar(datos)
    } catch (error) {
      setMensaje(error.message)
      setErrores(error.detalles || {})
    } finally {
      setOcupado(false)
    }
  }
  return { datos, cambiar, errores, mensaje, ocupado, enviar }
}
