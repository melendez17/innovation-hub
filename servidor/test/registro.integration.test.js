import assert from 'node:assert/strict'
import { randomUUID, scryptSync } from 'node:crypto'
import { once } from 'node:events'
import { test } from 'node:test'

// Nunca carga .env ni utiliza DB_NAME/MONGODB_URI del proyecto o de Atlas.
// Solo se borra la base temporal generada por esta prueba.
process.env.MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017'
process.env.DB_NAME = `innovation_registro_test_${randomUUID().replaceAll('-', '')}`
process.env.CLIENT_ORIGIN = 'http://localhost:5173'

const { conectar, desconectar, obtenerDb } = await import('../src/config/db.js')
const { app } = await import('../src/app.js')

test('registro seguro con MongoDB real', async (t) => {
  let servidor
  try {
    await conectar()
    servidor = app.listen(0, '127.0.0.1')
    await once(servidor, 'listening')
    const base = `http://127.0.0.1:${servidor.address().port}/api/usuarios`
    const datos = {
      nombre: ' Ana ', apellido1: ' Mora ', email: ' ANA@example.test ',
      password: 'Clave de prueba 123', confirmacionPassword: 'Clave de prueba 123',
      tipo: 'Estudiante', carrera: ' Software ', aceptaTerminos: true,
    }
    const registrar = async (cuerpo) => {
      const respuesta = await fetch(base, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo),
      })
      return { estado: respuesta.status, cuerpo: await respuesta.json() }
    }
    const sinCredenciales = (usuario) => {
      for (const campo of ['password', 'passwordHash', 'confirmacionPassword', 'aceptaTerminos']) {
        assert.equal(Object.hasOwn(usuario, campo), false, `No devolver ${campo}`)
      }
    }

    await t.test('201, normalización, hash verificable y respuesta sin credenciales', async () => {
      const respuesta = await registrar(datos)
      assert.equal(respuesta.estado, 201)
      assert.equal(respuesta.cuerpo.nombre, 'Ana')
      assert.equal(respuesta.cuerpo.email, 'ana@example.test')
      sinCredenciales(respuesta.cuerpo)
      const guardado = await obtenerDb().collection('usuarios').findOne({ email: 'ana@example.test' })
      assert.equal(Object.hasOwn(guardado, 'password'), false)
      const [algoritmo, n, r, p, salt, hash] = guardado.passwordHash.split('$')
      assert.equal(algoritmo, 'scrypt')
      const verificar = (password) => scryptSync(password, salt, 64, {
        N: Number(n), r: Number(r), p: Number(p), maxmem: 64 * 1024 * 1024,
      }).toString('hex')
      assert.equal(verificar(datos.password), hash)
      assert.notEqual(verificar('Otra contraseña'), hash)
      const listado = await (await fetch(base)).json()
      for (const usuario of listado) sinCredenciales(usuario)
    })

    await t.test('409 para correo duplicado y protección ante registros concurrentes', async () => {
      assert.equal((await registrar({ ...datos, email: 'ana@EXAMPLE.test' })).estado, 409)
      const concurrentes = await Promise.all([
        registrar({ ...datos, email: 'concurrente@example.test' }),
        registrar({ ...datos, email: 'CONCURRENTE@example.test' }),
      ])
      assert.deepEqual(concurrentes.map(r => r.estado).sort(), [201, 409])
      assert.equal(await obtenerDb().collection('usuarios').countDocuments(), 2)
      const registros = await obtenerDb().collection('usuarios').find().toArray()
      assert.notEqual(registros[0].passwordHash, registros[1].passwordHash, 'La sal es distinta para cada usuario')
    })

    await t.test('400 por datos inválidos, confirmación y términos', async () => {
      const antes = await obtenerDb().collection('usuarios').countDocuments()
      for (const cuerpo of [
        {}, [], { ...datos, nombre: '  ' }, { ...datos, apellido2: 123 },
        { ...datos, email: 'invalido' }, { ...datos, password: 'corta' },
        { ...datos, confirmacionPassword: 'Distinta' }, { ...datos, aceptaTerminos: false },
        { ...datos, tipo: 'Administrador' },
      ]) {
        const respuesta = await registrar(cuerpo)
        assert.equal(respuesta.estado, 400)
        assert.equal(respuesta.cuerpo.error.codigo, 'DATOS_INVALIDOS')
        assert.equal(typeof respuesta.cuerpo.error.detalles, 'object')
      }
      // Express rechaza null antes de llegar a la validación del recurso.
      const nulo = await registrar(null)
      assert.equal(nulo.estado, 400)
      assert.equal(nulo.cuerpo.error.codigo, 'JSON_INVALIDO')
      assert.equal(await obtenerDb().collection('usuarios').countDocuments(), antes)
    })

    await t.test('ignora campos adicionales y conserva los valores definidos por el servidor', async () => {
      const respuesta = await registrar({
        ...datos, email: 'extra@example.test', estado: 'Inactiva',
        passwordHash: 'hash enviado por el cliente', campoAdicional: 'no guardar',
      })
      assert.equal(respuesta.estado, 201)
      assert.equal(respuesta.cuerpo.estado, 'Activa')
      sinCredenciales(respuesta.cuerpo)
      const guardado = await obtenerDb().collection('usuarios').findOne({ email: 'extra@example.test' })
      assert.equal(guardado.estado, 'Activa')
      assert.notEqual(guardado.passwordHash, 'hash enviado por el cliente')
      assert.equal(Object.hasOwn(guardado, 'campoAdicional'), false)
    })
  } finally {
    if (servidor) await new Promise((resolve, reject) => servidor.close(error => error ? reject(error) : resolve()))
    try {
      if (servidor) await obtenerDb().dropDatabase()
    } finally {
      await desconectar()
    }
  }
})
