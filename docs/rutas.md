# Diseño de dos rutas GET públicas

Los ejemplos se refieren a peticiones sin sesión. Las columnas `Id` son numéricas en SQL Server y el servidor las serializa como texto en los campos de contrato `_id`, `propietarioId` y `proyectoId`. En la versión relacional, el parámetro acepta el nuevo identificador decimal positivo. Así se conserva la forma del JSON y cambia el valor de los identificadores respecto a MongoDB. Las fechas con hora se serializan como ISO 8601 en UTC.

## GET /api/iniciativas/{id}

Devuelve el detalle de la iniciativa solicitada. El acceso anónimo exige visibilidad `Pública` y estado distinto de `Borrador`, como en el [repositorio actual](../servidor/src/iniciativas/iniciativas.repository.js). Si no aparece la fila principal, se responde HTTP 404 con código `NO_ENCONTRADA`. Un parámetro inválido devuelve HTTP 400 con código `ID_INVALIDO`.

Lee `Iniciativas`, `Usuarios`, `Miembros`, `IniciativaCompetencias`, `Competencias`, `IniciativaEtiquetas` y `Proyectos`. La consulta recorre la relación muchos a muchos para obtener `competencias`. Los tres arreglos se consultan por separado para evitar multiplicar filas al combinar competencias, miembros y etiquetas.

### SQL parametrizado

```sql
-- @Id INT llega como parámetro. Las lecturas comparten una vista consistente.
SELECT i.Id, i.Titulo, i.Tipo, i.Resumen, i.Descripcion, i.Problema,
       i.Beneficiados, i.Categoria, i.CantidadIntegrantes, i.Visibilidad,
       i.Estado, i.PropietarioId, i.FechaCreacion, i.FechaPublicacion,
       i.FechaUltimaModificacion, p.Id AS ProyectoId,
       u.Nombre, u.Apellido1, u.Apellido2, u.Email
FROM dbo.Iniciativas AS i
INNER JOIN dbo.Usuarios AS u ON u.Id = i.PropietarioId
LEFT JOIN dbo.Proyectos AS p ON p.IniciativaId = i.Id
WHERE i.Id = @Id AND i.Visibilidad = N'Pública' AND i.Estado <> N'Borrador';

-- Ejecutar las siguientes lecturas solo cuando la primera devuelva una fila.
SELECT c.Id, c.Nombre
FROM dbo.IniciativaCompetencias AS ic
INNER JOIN dbo.Competencias AS c ON c.Id = ic.CompetenciaId
WHERE ic.IniciativaId = @Id
ORDER BY c.Id;

SELECT u.Id, u.Nombre, u.Apellido1, u.Apellido2, u.Email
FROM dbo.Usuarios AS u
INNER JOIN (
    SELECT PropietarioId AS UsuarioId
    FROM dbo.Iniciativas
    WHERE Id = @Id
    UNION
    SELECT UsuarioId
    FROM dbo.Miembros
    WHERE IniciativaId = @Id AND EstadoParticipacion = N'Activo'
) AS equipo ON equipo.UsuarioId = u.Id
ORDER BY u.Id;

SELECT Texto
FROM dbo.IniciativaEtiquetas
WHERE IniciativaId = @Id
ORDER BY Posicion;
```

El resultado principal aporta los campos de la iniciativa y el objeto `propietario`. Las demás filas forman `competencias`, `miembros` y `etiquetas`, con arreglos vacíos cuando corresponda. `integrantesActuales` es la longitud de `miembros`; `espaciosDisponibles` es el mayor entre cero y el cupo menos ese total. Para esta respuesta pública completa se añade `accesoCompleto: true`. Se omite `proyectoId` cuando el `LEFT JOIN` no encuentra proyecto, igual que en las iniciativas de Express que carecen del campo.

### HTTP 200 para GET /api/iniciativas/1

```json
{
  "_id": "1",
  "titulo": "Mapa accesible del campus",
  "tipo": "Reto",
  "resumen": "Identificar rutas accesibles.",
  "descripcion": "Construir un mapa de accesos y obstáculos.",
  "problema": "La información de accesos está dispersa.",
  "beneficiados": "Comunidad universitaria.",
  "categoria": "Tecnología",
  "cantidadIntegrantes": 3,
  "visibilidad": "Pública",
  "etiquetas": ["accesibilidad", "campus"],
  "estado": "Convertida en proyecto",
  "propietarioId": "1",
  "fechaCreacion": "2026-11-05T00:00:00.000Z",
  "fechaPublicacion": "2026-11-06T00:00:00.000Z",
  "fechaUltimaModificacion": "2026-11-12T00:00:00.000Z",
  "proyectoId": "1",
  "integrantesActuales": 2,
  "espaciosDisponibles": 1,
  "propietario": {
    "_id": "1",
    "nombre": "Ana",
    "apellido1": "Mora",
    "apellido2": null,
    "email": "ana@example.test"
  },
  "miembros": [
    {"_id": "1", "nombre": "Ana", "apellido1": "Mora", "apellido2": null, "email": "ana@example.test"},
    {"_id": "2", "nombre": "Bruno", "apellido1": "Vega", "apellido2": "Rojas", "email": "bruno@example.test"}
  ],
  "competencias": [
    {"_id": "1", "nombre": "Diseño UX"},
    {"_id": "2", "nombre": "JavaScript"}
  ],
  "accesoCompleto": true
}
```

## GET /api/competencias

Devuelve el catálogo completo ordenado por nombre. Solo lee `Competencias`. Al igual que el [repositorio actual](../servidor/src/competencias/competencias.repository.js), responde con un arreglo de objetos que contienen `_id` y `nombre`.

### SQL

```sql
SELECT Id, Nombre
FROM dbo.Competencias
ORDER BY Nombre, Id;
```

### HTTP 200

```json
[
  {"_id": "1", "nombre": "Diseño UX"},
  {"_id": "2", "nombre": "JavaScript"},
  {"_id": "3", "nombre": "Modelado relacional"},
  {"_id": "4", "nombre": "Pruebas de software"},
  {"_id": "5", "nombre": "Visualización de datos"}
]
```
