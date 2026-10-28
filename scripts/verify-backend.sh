#!/usr/bin/env bash
set -euo pipefail

# 8. Ir al directorio raíz del repo al inicio
cd "$(git rev-parse --show-toplevel)"

# 7. Variable CONNECTOR_DIR (por defecto dataconnect/connector)
CONNECTOR_DIR="${CONNECTOR_DIR:-dataconnect/connector}"
STATIC_ONLY="${STATIC_ONLY:-0}"

echo "=== 1. Verificando archivos en ${CONNECTOR_DIR} ==="
EXPECTED_FILES=$'connector.yaml\nmutations.gql\nqueries.gql'
ACTUAL_FILES="$(ls -1 "$CONNECTOR_DIR" | sort)"
if [ "$ACTUAL_FILES" != "$EXPECTED_FILES" ]; then
  echo "❌ Error: ${CONNECTOR_DIR} debe contener exactamente connector.yaml, mutations.gql y queries.gql"
  echo "Encontrado:"
  echo "$ACTUAL_FILES"
  exit 1
fi
echo "✅ Exactamente 3 archivos en ${CONNECTOR_DIR}"

echo "=== 2. Verificando operaciones, @auth y @check en ${CONNECTOR_DIR} ==="
if grep -En '^[[:space:]]*#.*@check[[:space:]]*\(' "$CONNECTOR_DIR/queries.gql" "$CONNECTOR_DIR/mutations.gql" >/dev/null 2>&1; then
  echo "❌ Error: Se detectó un @check comentado en ${CONNECTOR_DIR}:"
  grep -En '^[[:space:]]*#.*@check[[:space:]]*\(' "$CONNECTOR_DIR/queries.gql" "$CONNECTOR_DIR/mutations.gql"
  exit 1
fi

OPS_REPORT="$(mktemp)"
trap 'rm -f "$OPS_REPORT" "${TEST_OUT:-}"' EXIT

awk '
  /^(query|mutation) / {
    if (name != "") {
      print file ":" kind ":" name ":auth=" auth ":checks=" checks ":hh=" has_hh ":redact_fields=" redact_fields ":bad_expr=" bad_expr
    }
    kind = $1
    line = $0
    sub(/^(query|mutation) +/, "", line)
    sub(/[({ ].*$/, "", line)
    name = line
    file = FILENAME
    auth = "NONE"
    checks = 0
    has_hh = 0
    in_redact = 0
    redact_fields = 0
    bad_expr = 0
  }
  /@auth\(level: *USER\)/ { auth = "USER" }
  /@auth\(level: *NO_ACCESS\)/ { auth = "NO_ACCESS" }
  /^  query @redact \{/ { in_redact = 1; next }
  in_redact && /^  \}/ { in_redact = 0 }
  in_redact && /^    [a-zA-Z_][a-zA-Z0-9_]*([(:]| +)/ { redact_fields++ }
  /^[[:space:]]*#/ { next }
  /@check\(/ {
    checks++
    expr_line = $0
    if (match(expr_line, /expr:[[:space:]]*"[^"]*"/)) {
      expr_val = substr(expr_line, RSTART, RLENGTH)
      sub(/^expr:[[:space:]]*"/, "", expr_val)
      sub(/"$/, "", expr_val)
      if (expr_val ~ /^[[:space:]]*true[[:space:]]*$/ || expr_val !~ /(this|vars|auth)/) {
        bad_expr++
      }
    } else {
      bad_expr++
    }
  }
  /household\.id *== *vars\.householdId/ { has_hh = 1 }
  END {
    if (name != "") {
      print file ":" kind ":" name ":auth=" auth ":checks=" checks ":hh=" has_hh ":redact_fields=" redact_fields ":bad_expr=" bad_expr
    }
  }
' "$CONNECTOR_DIR/queries.gql" "$CONNECTOR_DIR/mutations.gql" > "$OPS_REPORT"

# 1. NO_ACCESS obligatorio en NegativeEntries, UnbalancedJournals, CreateSettlement, DeleteSettlement, UpsertExchangeRate, BackfillMemberSlots
for op in NegativeEntries UnbalancedJournals CreateSettlement DeleteSettlement UpsertExchangeRate BackfillMemberSlots; do
  if ! grep -q ":${op}:auth=NO_ACCESS:" "$OPS_REPORT"; then
    echo "❌ Error: La operación ${op} debe existir y tener @auth(level: NO_ACCESS)"
    exit 1
  fi
done
echo "✅ NO_ACCESS confirmado en NegativeEntries, UnbalancedJournals, CreateSettlement, DeleteSettlement, UpsertExchangeRate y BackfillMemberSlots"

# 3. Para toda operación USER fuera de la lista permitida (GetCurrentUser, GetLatestRate, CreateHouseholdAndUser, GetInvitation, AcceptInvitation):
#    - rechazar @check con expr "true" o solo literales
#    - exigir redact_fields >= 1 en mutaciones USER ("bloque @redact no detectado")
#    - exigir al menos un @check y "household.id == vars.householdId"
#    - exigir que cada campo de query @redact tenga su @check
INVALID_OPS="$(awk -F: '
  {
    kind = $2
    op = $3
    auth = $4
    checks = $5
    sub(/^checks=/, "", checks)
    hh = $6
    sub(/^hh=/, "", hh)
    rf = $7
    sub(/^redact_fields=/, "", rf)
    be = $8
    sub(/^bad_expr=/, "", be)

    if (be + 0 > 0) {
      print $0 " (@check con expr true o solo literales)"
      next
    }
    if (auth == "auth=NO_ACCESS") next
    if (auth != "auth=USER") {
      print $0 " (sin @auth válido)"
      next
    }
    if (op == "GetCurrentUser" || op == "GetLatestRate" || op == "CreateHouseholdAndUser") next

    if (op == "GetInvitation") {
      if (checks + 0 < 1) {
        print $0 " (0 @check)"
      }
      next
    }

    if (op == "AcceptInvitation") {
      if (kind == "mutation" && (rf + 0) < 1) {
        print $0 " (bloque @redact no detectado)"
      } else if (checks + 0 < 1) {
        print $0 " (0 @check)"
      } else if (rf + 0 > 0 && (checks + 0) < (rf + 0)) {
        print $0 " (campo en query @redact sin @check)"
      }
      next
    }

    if (kind == "mutation" && (rf + 0) < 1) {
      print $0 " (bloque @redact no detectado)"
    } else if (checks + 0 < 1) {
      print $0 " (0 @check)"
    } else if (hh + 0 != 1) {
      print $0 " (falta household.id == vars.householdId)"
    } else if (rf + 0 > 0 && (checks + 0) < (rf + 0)) {
      print $0 " (campo en query @redact sin @check)"
    }
  }
' "$OPS_REPORT")"

if [ -n "$INVALID_OPS" ]; then
  echo "❌ Error: Operaciones USER inválidas o sin las validaciones requeridas:"
  echo "$INVALID_OPS"
  exit 1
fi
echo "✅ Todas las operaciones USER fuera de la lista permitida tienen @check válido, bloque @redact (en mutaciones) y household.id == vars.householdId"

echo "=== 3. Verificando ausencia de regex genéricas o vacías prohibidas en scripts/test-dc.ts ==="
if grep -En 'Permission|permission denied|Unauthorized' scripts/test-dc.ts; then
  echo "❌ Error: scripts/test-dc.ts contiene Permission, 'permission denied' o Unauthorized"
  exit 1
fi
if grep -En '\}[[:space:]]*,[[:space:]]*(/(\.\*|\.)?/[a-z]*|new[[:space:]]+RegExp\([[:space:]]*["'\''](\.\*|\.)?["'\''][[:space:]]*\)|["'\'']{2})' scripts/test-dc.ts; then
  echo "❌ Error: scripts/test-dc.ts contiene un expectRejected con regex /./, /.*/ o vacía"
  exit 1
fi
echo "✅ scripts/test-dc.ts libre de Permission / permission denied / Unauthorized y de regex /./, /.*/ o vacías"

if [ "$STATIC_ONLY" = "1" ]; then
  echo "✅ Verificación estática completada con éxito (STATIC_ONLY=1)."
  exit 0
fi

echo "=== 4. Verificando que los puertos 9099 y 9399 estén libres ==="
if lsof -i :9099 -i :9399 >/dev/null 2>&1; then
  echo "❌ Error: Los puertos 9099 o 9399 están ocupados. Apaga los emuladores activos antes de correr verify-backend.sh."
  lsof -i :9099 -i :9399
  exit 1
fi
echo "✅ Puertos 9099 y 9399 libres"

echo "=== 5. Ejecutando npm run build ==="
npm run build

echo "=== 6. Ejecutando npm run test:backend ==="
TEST_OUT="$(mktemp)"
npm run test:backend 2>&1 | tee "$TEST_OUT"

FAIL_COUNT="$(grep -c '❌' "$TEST_OUT" || true)"
PASS_COUNT="$(grep -c '✅' "$TEST_OUT" || true)"

if [ "$FAIL_COUNT" -ne 0 ]; then
  echo "❌ Error: Se encontraron ${FAIL_COUNT} líneas con ❌ en test:backend"
  exit 1
fi

if [ "$PASS_COUNT" -lt 100 ]; then
  echo "❌ Error: Se esperaban al menos 100 líneas con ✅, pero se obtuvieron ${PASS_COUNT}"
  exit 1
fi

if ! grep -Fq "🎉 Todas las pruebas pasaron exitosamente." "$TEST_OUT"; then
  echo "❌ Error: No se encontró el texto final exacto «🎉 Todas las pruebas pasaron exitosamente.»"
  exit 1
fi

echo "✅ Backend verificado exitosamente (${PASS_COUNT} ✅, ${FAIL_COUNT} ❌)."
