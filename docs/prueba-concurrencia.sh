#!/bin/bash
# =====================================================================
#  Prueba de concurrencia (Git Bash / Linux / macOS)
#
#  Dispara dos pujas identicas en paralelo sobre la misma subasta.
#  Esperado: una responde 201 Created y la otra 409 Conflict, y en la
#  base queda UNA sola puja nueva.
#
#  Uso:  bash prueba-concurrencia.sh [PUERTO] [SUBASTA_ID] [MONTO]
# =====================================================================
PUERTO="${1:-5000}"
SUBASTA="${2:-1}"
MONTO="${3:-60000}"
URL="http://localhost:$PUERTO/api/subastas/$SUBASTA/pujas"

echo "Dos pujas simultaneas de $MONTO sobre la subasta $SUBASTA..."
echo ""

for USUARIO in 2 3; do
  curl -s -o /dev/null -w "Usuario $USUARIO  ->  HTTP %{http_code}\n" \
    -X POST "$URL" \
    -H "Content-Type: application/json" \
    -H "X-Usuario-Id: $USUARIO" \
    -d "{\"monto\": $MONTO}" &
done

wait
echo ""
echo "Esperado: un 201 y un 409."
echo "Si ves dos 201, el control de concurrencia no esta funcionando."
