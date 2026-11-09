# Datos ficticios de demostración

Esta carga prepara MongoDB para probar los avances 1 y 2 en la aplicación React.
No modifica el prototipo independiente de `avance1/`.

Desde la carpeta `servidor`, con las dependencias instaladas y `.env` configurado
para la base que utiliza tu API:

```powershell
npm run datos:competencias
```

Ese comando agrega únicamente el catálogo de 12 competencias. Para cargar además
los usuarios y todos los ejemplos:

```powershell
npm run datos:demo
```

El segundo comando también incluye las competencias; no es necesario ejecutar ambos.
Utiliza `MONGODB_URI` y `DB_NAME` de `servidor/.env`. No compartas ese archivo.
No borra colecciones ni sobrescribe registros existentes. Los identificadores de
los ejemplos son estables: repetir la carga agrega registros faltantes, sin reiniciar
sus estados ni restaurar los cambios que hagas en ellos. No es un comando de reinicio.

Al terminar, recarga React. Las competencias se seleccionan en **Editar mi perfil**,
**Crear/editar iniciativa** y **Solicitar participación**. Agregar una competencia al
perfil o a la iniciativa la selecciona del catálogo; no crea una competencia nueva.

## Cuentas ficticias

Contraseña inicial de todas: **`Demo2026!`**. Solo son cuentas de demostración.
La base guarda hashes, no esa contraseña en texto plano. Repetir la carga no cambia
la contraseña si ya la modificaste.

| Correo | Tipo | Ejemplos para probar |
| --- | --- | --- |
| `ana@demo.innovation.test` | Estudiante | Propietaria del huerto, reto restringido, borrador y proyecto público |
| `luis@demo.innovation.test` | Estudiante | Integrante del huerto y del reto restringido; propietario de feria y agenda cultural |
| `sofia@demo.innovation.test` | Docente | Propietaria de tutorías, iniciativa privada y proyecto privado |
| `diego@demo.innovation.test` | Administrativo | Solicitud pendiente al huerto; integrante de los ejemplos privados de Sofía |
| `valeria@demo.innovation.test` | Estudiante | Integrante del proyecto público y del equipo con cupo completo |

## Qué incluye y cómo comprobarlo

- 12 competencias, 5 usuarios, 13 iniciativas y 2 proyectos.
- Ideas, necesidades y retos con las cuatro visibilidades.
- Borrador, Publicada, En formación de equipo, Convertida en proyecto y Archivada.
- 12 solicitudes: 6 aceptadas vinculadas a integrantes y 6 ejemplos adicionales
  pendientes, rechazados o cancelados. 6 registros de incorporación al equipo.
- Una solicitud pendiente para un equipo lleno: aceptar debe rechazarse por falta de cupo.
- Un proyecto público con `https://github.com/octocat/Hello-World` como repositorio
  público de ejemplo. No representa el código del proyecto ficticio. La consulta
  depende de la disponibilidad y del límite de la API de GitHub.
- Un proyecto privado sin repositorio para comprobar visibilidad y el estado sin enlace.

1. Sin iniciar sesión, consulta el catálogo: solo aparecen iniciativas públicas disponibles.
2. Con Ana, usa **Mostrar → Mis iniciativas** y aplica los filtros. Allí aparecen
   su borrador y sus iniciativas, y en el huerto puedes consultar solicitudes recibidas.
3. Con Diego, entra a **Mis solicitudes**: puedes editar o cancelar la pendiente al huerto.
4. Con Ana, acepta esa solicitud: Diego se incorpora y puede verse en el equipo.
5. Con Sofía, consulta sus iniciativas y proyectos privados desde las vistas propias;
   Diego puede encontrarlos desde las vistas del equipo. Luis no tiene acceso a ellos.
6. Con Sofía o Valeria, el reto de accesibilidad restringido muestra solo el resumen;
   con Ana o Luis muestra el detalle completo.
7. Con Ana, publica el borrador, prueba el retiro de un integrante del huerto o convierte
   el reto de accesibilidad en proyecto. Estas acciones cambian los datos guardados.
8. Elimina una iniciativa publicada sin relaciones, por ejemplo la agenda cultural con Luis.
   En cambio, la feria tiene una solicitud histórica y debe archivarse al intentar eliminarla.

Los privados, borradores y archivados no se muestran en el catálogo general.
Que no aparezcan allí es el comportamiento esperado, no un fallo en la carga.
