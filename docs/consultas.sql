-- SQL Server. Cada ejemplo parte por separado de los datos de modelo-datos.md.

-- 1. JOIN uno a muchos: iniciativas con el nombre y primer apellido del propietario.
-- Esperado (IniciativaId, Titulo, Propietario):
-- (1, Mapa accesible del campus, Ana Mora),
-- (2, Taller de prototipado, Bruno Vega), (3, Tablero de consumo, Carla Solís).
SELECT i.Id AS IniciativaId, i.Titulo,
       CONCAT(u.Nombre, N' ', u.Apellido1) AS Propietario
FROM dbo.Iniciativas AS i
INNER JOIN dbo.Usuarios AS u ON u.Id = i.PropietarioId
ORDER BY i.Id;

-- 2. JOIN muchos a muchos: competencias requeridas por cada iniciativa.
-- Esperado (IniciativaId, Competencia):
-- (1, Diseño UX), (1, JavaScript), (2, Diseño UX), (2, Pruebas de software),
-- (3, Modelado relacional), (3, Visualización de datos).
SELECT i.Id AS IniciativaId, c.Nombre AS Competencia
FROM dbo.Iniciativas AS i
INNER JOIN dbo.IniciativaCompetencias AS ic ON ic.IniciativaId = i.Id
INNER JOIN dbo.Competencias AS c ON c.Id = ic.CompetenciaId
ORDER BY i.Id, c.Id;

-- 3. GROUP BY: solicitudes por iniciativa, incluidas las que tienen cero.
-- Esperado (IniciativaId, TotalSolicitudes): (1, 1), (2, 1), (3, 0).
SELECT i.Id AS IniciativaId, COUNT(s.Id) AS TotalSolicitudes
FROM dbo.Iniciativas AS i
LEFT JOIN dbo.Solicitudes AS s ON s.IniciativaId = i.Id
GROUP BY i.Id
ORDER BY i.Id;

-- 4. UPDATE: ampliar a cuatro personas el cupo del mapa.
-- Esperado: se modifica una fila, la iniciativa 1. Quedan 2 espacios con 2 integrantes.
UPDATE dbo.Iniciativas
SET CantidadIntegrantes = 4,
    FechaUltimaModificacion = SYSUTCDATETIME()
WHERE Id = 1;

-- 5. DELETE: quitar solo la etiqueta campus del mapa.
-- Esperado: se elimina (IniciativaId = 1, Posicion = 2) y se conserva accesibilidad.
DELETE FROM dbo.IniciativaEtiquetas
WHERE IniciativaId = 1 AND Posicion = 2;

-- 6. INSERT rechazado: intentar asignar JavaScript a Ana por segunda vez.
-- Esperado: error 2627 por repetir la PK (UsuarioId, CompetenciaId) = (1, 2).
INSERT INTO dbo.UsuarioCompetencias (UsuarioId, CompetenciaId)
VALUES (1, 2);
