import { createHash } from 'node:crypto'
import { ObjectId } from 'mongodb'
import { conectar, desconectar, obtenerDb } from '../src/config/db.js'
import { crearPasswordHash } from '../src/utils/password.js'
import { competencias, usuarios, iniciativas, solicitudes } from './demostracion.js'

// Identificadores estables: repetir la carga no duplica los ejemplos.
const id = (coleccion, clave) => new ObjectId(createHash('sha256')
  .update(`innovation-hub-demostracion-v1:${coleccion}:${clave}`).digest('hex').slice(0, 24))
const correo = clave => `${clave}@demo.innovation.test`
const soloCompetencias = process.argv.includes('--solo-competencias')
const resumen = {}

async function insertar(coleccion, clave, datos) {
  const resultado = await obtenerDb().collection(coleccion).updateOne(
    { _id: id(coleccion, clave) }, { $setOnInsert: datos }, { upsert: true }
  )
  resumen[coleccion] = (resumen[coleccion] || 0) + resultado.upsertedCount
}

async function cargar() {
  await conectar()
  const db = obtenerDb()
  const idsCompetencias = new Map()
  for (const nombre of competencias) {
    // Si el catálogo ya contiene este nombre, reutiliza su identificador.
    const existente = await db.collection('competencias').findOne(
      { nombre }, { collation: { locale: 'es', strength: 2 } }
    )
    if (!existente) await insertar('competencias', nombre, { nombre })
    idsCompetencias.set(nombre, existente?._id || id('competencias', nombre))
  }
  if (!soloCompetencias) {
    // Revisa los correos antes de insertar usuarios; no ocupa cuentas ajenas.
    for (const usuario of usuarios) {
      const existente = await db.collection('usuarios').findOne({ email: correo(usuario.clave) })
      if (existente && !existente._id.equals(id('usuarios', usuario.clave))) {
        throw new Error(`El correo ficticio ${correo(usuario.clave)} ya pertenece a otra cuenta. No se modificó esa cuenta.`)
      }
    }
    const fecha = new Date()
    const antes = dias => new Date(fecha.getTime() - dias * 86400000)
    for (const usuario of usuarios) {
      await insertar('usuarios', usuario.clave, {
        nombre: usuario.nombre, apellido1: usuario.apellido1, apellido2: null,
        email: correo(usuario.clave), passwordHash: await crearPasswordHash('Demo2026!'),
        tipo: usuario.tipo, carrera: usuario.carrera, estado: 'Activa',
        fechaRegistro: antes(14), descripcionPersonal: 'Perfil ficticio para demostración de Innovation Hub.',
        intereses: usuario.intereses, disponibilidad: usuario.disponibilidad, portafolio: null,
        competencias: usuario.competencias.map(nombre => idsCompetencias.get(nombre)),
      })
    }
    for (const iniciativa of iniciativas) {
      const convertida = iniciativa.estado === 'Convertida en proyecto'
      await insertar('iniciativas', iniciativa.clave, {
        titulo: iniciativa.titulo, tipo: iniciativa.tipo, resumen: iniciativa.resumen,
        descripcion: iniciativa.descripcion, problema: iniciativa.problema || null,
        beneficiados: iniciativa.beneficiados || 'Comunidad universitaria.',
        categoria: iniciativa.categoria, visibilidad: iniciativa.visibilidad,
        competencias: iniciativa.competencias.map(nombre => idsCompetencias.get(nombre)),
        etiquetas: iniciativa.etiquetas, cantidadIntegrantes: iniciativa.cupo,
        propietarioId: id('usuarios', iniciativa.propietario),
        miembros: [iniciativa.propietario, ...(iniciativa.integrantes || [])].map(clave => id('usuarios', clave)),
        estado: iniciativa.estado, fechaCreacion: antes(10),
        fechaPublicacion: iniciativa.estado === 'Borrador' ? null : antes(9),
        fechaUltimaModificacion: antes(1),
        ...(convertida ? { proyectoId: id('proyectos', iniciativa.clave) } : {}),
      })
      for (const integrante of iniciativa.integrantes || []) {
        const usuario = usuarios.find(item => item.clave === integrante)
        const competencia = usuario.competencias[0]
        await insertar('miembros', `${iniciativa.clave}:${integrante}`, {
          iniciativaId: id('iniciativas', iniciativa.clave), usuarioId: id('usuarios', integrante),
          rol: competencia, fechaIncorporacion: antes(5), estadoParticipacion: 'Activo',
          fechaRetiro: null, motivoRetiro: null,
        })
        await insertar('solicitudes', `aceptada:${iniciativa.clave}:${integrante}`, {
          iniciativaId: id('iniciativas', iniciativa.clave), solicitanteId: id('usuarios', integrante),
          mensaje: 'Me gustaría aportar mis habilidades a esta iniciativa.', competenciaId: idsCompetencias.get(competencia),
          rol: competencia, disponibilidad: usuario.disponibilidad, fechaSolicitud: antes(6), estado: 'Aceptada',
          respuesta: { decision: 'Aceptada', comentario: 'Solicitud ficticia aceptada para demostrar el equipo.', fechaDecision: antes(5) },
        })
      }
      if (convertida) {
        await insertar('proyectos', iniciativa.clave, {
          iniciativaId: id('iniciativas', iniciativa.clave), propietarioId: id('usuarios', iniciativa.propietario),
          nombre: iniciativa.titulo, descripcion: iniciativa.descripcion,
          objetivo: 'Desarrollar una primera versión que atienda la necesidad descrita por el equipo.',
          tecnologias: ['React', 'Express', 'MongoDB'], estado: 'Planificación',
          fechaInicio: antes(2).toISOString().slice(0, 10), fechaFinEstimada: null,
          // Repositorio público de ejemplo: no representa el código de este proyecto ficticio.
          repositorioUrl: iniciativa.clave === 'proyecto-publico' ? 'https://github.com/octocat/Hello-World' : null,
          fechaCreacion: antes(2), fechaUltimaModificacion: antes(2),
        })
      }
    }
    for (const solicitud of solicitudes) {
      await insertar('solicitudes', solicitud.clave, {
        iniciativaId: id('iniciativas', solicitud.iniciativa), solicitanteId: id('usuarios', solicitud.solicitante),
        competenciaId: idsCompetencias.get(solicitud.competencia), mensaje: 'Quiero colaborar y aportar al trabajo del equipo.',
        rol: solicitud.rol, disponibilidad: usuarios.find(u => u.clave === solicitud.solicitante).disponibilidad,
        estado: solicitud.estado, fechaSolicitud: antes(7),
        respuesta: solicitud.estado === 'Rechazada' ? {
          decision: 'Rechazada', comentario: 'Ejemplo de una solicitud rechazada.', fechaDecision: antes(6),
        } : null,
      })
    }
  }
  console.log('Registros nuevos:', resumen)
  console.log('Los registros existentes y sus modificaciones se conservan.')
  if (!soloCompetencias) {
    console.log('Cuentas ficticias:', usuarios.map(usuario => correo(usuario.clave)).join(', '))
    console.log('Contraseña inicial de las cuentas ficticias: Demo2026!')
  }
}

try { await cargar() } catch (error) {
  console.error('No se completó la carga. Revise la conexión y los datos; no se borró ninguna colección.')
  // No imprimir errores de MongoDB: pueden incluir información de conexión.
  if (error.message.startsWith('El correo ficticio')) console.error(error.message)
  process.exitCode = 1
} finally { await desconectar() }
