# Entity Framework Core en Innovation Hub

## ¿Cuándo usar Select, Include y AsNoTracking?

`Select` proyecta los campos que necesita la respuesta. En el detalle de iniciativa, permite pedir título, descripción y propietario, y proyectar las competencias relacionadas como pares de identificador y nombre. Así se construye un DTO con el contrato de la ruta sin cargar columnas como `PasswordHash`. El filtro por identificador, visibilidad pública y estado se aplica antes de materializar. [Microsoft Learn: Consultas eficientes](https://learn.microsoft.com/es-es/ef/core/performance/efficient-querying)

`Include` carga entidades relacionadas en sus propiedades de navegación. Conviene cuando el código necesita trabajar con el grafo de entidades, por ejemplo, al cargar una iniciativa y sus participaciones para aplicar cambios que luego se guardarán con `SaveChanges`. Cargar varias colecciones en una sola consulta puede multiplicar las filas devueltas. [Microsoft Learn: Carga diligente](https://learn.microsoft.com/es-es/ef/core/querying/related-data/eager) · [Consultas únicas y divididas](https://learn.microsoft.com/es-es/ef/core/querying/single-split-queries)

`AsNoTracking` evita registrar entidades en el rastreador de cambios cuando se leen para responder un GET. Si la proyección devuelve únicamente DTO y valores escalares, EF Core ya carece de entidades que rastrear. Si la proyección incluye una entidad, la consulta sí puede rastrearla salvo que se pida lo contrario. [Microsoft Learn: Consultas con y sin seguimiento](https://learn.microsoft.com/es-es/ef/core/querying/tracking)

## ¿Cuándo modelar la tabla intermedia como entidad?

`UsuarioCompetencias` e `IniciativaCompetencias` solo guardan dos llaves foráneas. EF Core puede representar cada relación con navegaciones en ambos lados y administrar la tabla intermedia sin declarar una clase propia. La PK compuesta impide asignar dos veces la misma competencia. [Microsoft Learn: Relaciones de varios a varios](https://learn.microsoft.com/es-es/ef/core/modeling/relationships/many-to-many)

`Miembros` sí merece una entidad explícita. Cada participación registra rol, fecha de incorporación, estado y posibles datos de retiro. Por ejemplo, Bruno participa en la iniciativa 1 con el rol Diseño UX. Si se retira, se actualiza su participación y se conserva el historial. El equipo activo se obtiene de las participaciones activas más el propietario. El proyecto asociado usa ese mismo equipo. [Microsoft Learn: Entidad de combinación con carga](https://learn.microsoft.com/es-es/ef/core/modeling/relationships/many-to-many#many-to-many-and-join-table-with-payload)

## ¿Cómo se pagina en la base?

`Skip` omite las filas de páginas anteriores y `Take` limita el tamaño de página. En SQL Server, una consulta ordenada con ambas operaciones puede traducirse a `ORDER BY ... OFFSET @Salto ROWS FETCH NEXT @Tamano ROWS ONLY`. Por ejemplo, para la segunda página de 10 iniciativas públicas, se filtra el catálogo, se ordena por fecha de creación descendente e identificador descendente, se omiten 10 filas y se piden hasta otras 10. El identificador desempata fechas iguales y hace único el orden. [Microsoft Learn: Paginación](https://learn.microsoft.com/es-es/ef/core/querying/pagination) · [ORDER BY en Transact-SQL](https://learn.microsoft.com/es-es/sql/t-sql/queries/select-order-by-clause-transact-sql)

Aplicar `Skip` y `Take` antes de `ToListAsync` permite que SQL Server envíe solo las filas de la página. Si se materializa primero, viaja todo el resultado y el servidor web consume memoria para descartar la mayoría de las filas. Incluso en la base, un desplazamiento grande tiene costo y las escrituras entre peticiones pueden desplazar filas. Para navegación secuencial se puede usar como cursor la fecha y el identificador del último resultado. [Microsoft Learn: Paginación](https://learn.microsoft.com/es-es/ef/core/querying/pagination)
