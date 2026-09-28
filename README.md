# Innovation Hub
 
Proyecto del curso SOFT-12 — Desarrollo Web Full Stack.
 
**Estudiante:** Andrés Meléndez y Roberto Gonzalez 
**Sección:** SCV2    **Periodo:** III cuatrimestre 2026
**Docente:** Alvaro Cordero
 
## Descripción
 
Aplicación web que permite publicar ideas, necesidades y retos,
declarar las competencias que cada iniciativa requiere y conformar
equipos interdisciplinarios dentro de la comunidad universitaria.
 
## Estructura del repositorio
 
- `avance1/` — prototipo con HTML, CSS, JavaScript, Bootstrap y Sass
  - `paginas/` — pantallas del prototipo
  - `css/`     — estilos de los archivos
  - `datos/`   — archivos JSON con datos simulados
  - `js/`      — módulos de JavaScript
  - `scss/`    — variables y parciales de Sass
  - `css/`     — hoja de estilos compilada
- `README.md` — Nos permite explicar qué es innovation-hub
- `.gitignore` — Nos permite excluir ciertos archivos
 
## Cómo ejecutar
 
Abrir `avance1/index.html` en el navegador. No requiere instalación.
Se recomienda utilizar ventana de incognito para evitar problemas con el Local Storage.
 
## Decisiones de diseño
 
Se escogio una paleta de azules para el diseño de la página.
Se aplico el diseño mobile first para asegurar la responsividada.
Se utilizaron iconos de FontAwesome para darle un poco de personalidad a la página.
 
## Resumen de commits|| # |

<!-- INICIO TABLA COMMITS -->
| # | Fecha | Hash | Mensaje |
|---|-------|------|---------|
| 1 | 2026-09-08 | 76adcc0 | Crear estructura del avance 1 y documentacion inicial |
| 2 | 2026-09-08 | 4a755e6 | Creación de tabla de commits en el README |
| 3 | 2026-09-08 | d168472 | "Probar automatización de tabla con git hook" |
| 4 | 2026-09-08 | f14b6f2 | Segunda prueba de automatización con git hook |
| 5 | 2026-09-08 | 4a6e3f8 | Tercer prueba de automatización de tabla con git hook |
| 6 | 2026-09-22 | 383e65e | Inicializaci[on de toda la parte de estilos del proyecto Sass y compilaci[on de CSS |
| 7 | 2026-09-22 | d0697f9 | Estructura inicial del html con el bootstrap incorporado |
| 8 | 2026-09-22 | 4306124 | Actualización del Readme con la información de los integrantes |
| 9 | 2026-09-23 | 6338984 | Reorganizacion de los estilos sass, como ejemplo para diseñar a futuro |
| 10 | 2026-09-23 | 499003f | Creacion de la pagina de catalogos y la funcionalidad basica de cargar informacion de datos json |
| 11 | 2026-09-24 | e8b42a1 | Completar creacion automatica de tarjetas de iniciativas para el catalogo |
| 12 | 2026-09-24 | 2a10ce4 | Crear barra de busqueda y boron de filtro para el catalogo Solo Mobile. Aun sin funcionalidad |
| 13 | 2026-09-25 | 1fa3f1a | Agregar funcionalidad de filtros de busqueda y categoria en el catalogo |
| 14 | 2026-09-26 | 7f8644a | Corregir bug al eliminar los filtros de categoria |
| 15 | 2026-09-26 | d3ae011 | Cambiar el EventListener al boton de cerrado en lugar de toda la alerta de filtro de categoria |
| 16 | 2026-09-26 | e961ac2 | Configurar responsibidad a los elementos del catalogo |
| 17 | 2026-09-26 | 9b0ed36 | Agregar Iniciativas al iniciativas.json |
| 18 | 2026-09-26 | daa6924 | Funcionalidad de cargar informacion en la pagina de detalles de Iniciativa |
| 19 | 2026-09-26 | 772fda5 | Agregar estilos a la pagina de detalle de iniciativa |
| 20 | 2026-09-27 | 2358036 | Agregar friltros de tipo y competencia al Catalogo |
| 21 | 2026-09-27 | f7716ff | Diseño y responsividad del perfil de usuario |
| 22 | 2026-09-27 | e567c0d | Funcion de eliminar con confirmacion en detalle de Iniciativa |
| 23 | 2026-09-27 | 91a0fbb | Actualizar tabla de commits en el README |
| 24 | 2026-09-27 | 9a65d6e | Agregar páginas para editar con funcionalidad de carga y edición de datos |
| 25 | 2026-09-27 | 3b02684 | Modificar visibilidad en ejemplo de iniciativas, agregar página para nueva iniciativa y validaciones sobre el formulario |
| 26 | 2026-09-27 | ab61c93 | Agregar entrada a la tabla de commits en el README para la funcionalidad de edición de datos |
<!-- FIN TABLA COMMITS -->

Para activar la actualización automática de la tabla de commits antes de cada commit, ejecuta:
```bash
cp herramientas/tabla-commits.sh .git/hooks/pre-commit
