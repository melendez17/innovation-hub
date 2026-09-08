#!/bin/bash

# Generar el contenido de la tabla en un archivo temporal
TABLA_TMP=$(mktemp)

echo "| # | Fecha | Hash | Mensaje |" > "$TABLA_TMP"
echo "|---|-------|------|---------|" >> "$TABLA_TMP"

git log --reverse --date=short --pretty=format:"%ad|%h|%s" \
  | nl -w1 -s'|' \
  | awk -F'|' '{print "| " $1 " | " $2 " | " $3 " | " $4 " |"}' >> "$TABLA_TMP"

# Reemplazar el bloque delimitado en el README.md
awk -v tabla="$(cat "$TABLA_TMP")" '
  /<!-- INICIO TABLA COMMITS -->/ {
    print
    print tabla
    skip=1
    next
  }
  /<!-- FIN TABLA COMMITS -->/ {
    skip=0
  }
  !skip
' README.md > README.tmp && mv README.tmp README.md

rm -f "$TABLA_TMP"