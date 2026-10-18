#!/bin/bash
set -e

echo "=========================================================="
echo "      INSPECCIÓN Y VERIFICACIÓN DE CIERRE DE BACKEND     "
echo "=========================================================="

FAILED=0

# Asegurar Java en PATH si existe en el directorio local del usuario
if [ -d "$HOME/.local/java/jdk-21.0.2+13-jre/bin" ]; then
  export PATH="$HOME/.local/java/jdk-21.0.2+13-jre/bin:$PATH"
fi

echo ""
echo "[1/4] Verificando contenido de dataconnect/connector/..."
EXPECTED_FILES=("connector.yaml" "mutations.gql" "queries.gql")
ACTUAL_FILES=($(ls -1 dataconnect/connector/ | sort))
JOINED_EXPECTED="connector.yaml mutations.gql queries.gql"
JOINED_ACTUAL="${ACTUAL_FILES[*]}"

if [ "$JOINED_EXPECTED" = "$JOINED_ACTUAL" ]; then
  echo "  ✅ dataconnect/connector/ contiene exactamente: $JOINED_ACTUAL (sin archivos sueltos)"
else
  echo "  ❌ ERROR: Archivos inesperados en dataconnect/connector/: $JOINED_ACTUAL"
  FAILED=1
fi

echo ""
echo "[2/4] Verificando nivel de acceso de auditoría y consultas en queries.gql..."
if grep -q "query NegativeEntries @auth(level: NO_ACCESS)" dataconnect/connector/queries.gql && \
   grep -q "query UnbalancedJournals @auth(level: NO_ACCESS)" dataconnect/connector/queries.gql; then
  echo "  ✅ NegativeEntries y UnbalancedJournals están protegidas con @auth(level: NO_ACCESS)"
else
  echo "  ❌ ERROR: Consultas de auditoría no tienen @auth(level: NO_ACCESS)"
  FAILED=1
fi

echo ""
echo "[3/4] Verificando compilación de TypeScript y bundle de producción (npm run build)..."
BUILD_OUTPUT=$(npm run build 2>&1)
if [ $? -eq 0 ]; then
  echo "  ✅ npm run build terminó con código 0 sin errores."
else
  echo "  ❌ ERROR: npm run build falló:"
  echo "$BUILD_OUTPUT"
  FAILED=1
fi

echo ""
echo "[4/4] Ejecutando suite de pruebas de DataConnect (npm run test:backend)..."
TEST_LOG=$(mktemp)
set +e
npm run test:backend > "$TEST_LOG" 2>&1
TEST_EXIT_CODE=$?
set -e

if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo "  ✅ npm run test:backend terminó con código 0."
else
  echo "  ❌ ERROR: npm run test:backend falló con código $TEST_EXIT_CODE"
  FAILED=1
fi

if grep -q "❌" "$TEST_LOG"; then
  echo "  ❌ ERROR: Se detectaron casos fallidos (❌) en las pruebas."
  grep "❌" "$TEST_LOG"
  FAILED=1
else
  echo "  ✅ No hay casos fallidos (0 casos con ❌)."
fi

# Verificar presencia de casos requeridos
CASES=("CASO 12.5" "CASO 15.1" "CASO 15.2" "CASO 15.3" "CASO 15.4")
for c in "${CASES[@]}"; do
  if grep -q "$c" "$TEST_LOG"; then
    echo "  ✅ $c está presente y ejecutado."
  else
    echo "  ❌ ERROR: $c no se encontró en la salida de pruebas."
    FAILED=1
  fi
done

# Verificar mensaje de rechazo de CASO 12.5
if grep -A 2 "CASO 12.5" "$TEST_LOG" | grep -iq "El recurso no pertenece a este hogar"; then
  echo "  ✅ CASO 12.5 rechaza mencionando el hogar ('El recurso no pertenece a este hogar')."
else
  echo "  ❌ ERROR: CASO 12.5 no contiene el mensaje esperado sobre el hogar."
  FAILED=1
fi

rm -f "$TEST_LOG"

echo ""
echo "=========================================================="
if [ $FAILED -eq 0 ]; then
  echo "  🎉 CIERRE DE BACKEND VERIFICADO CON ÉXITO (4/4)"
  echo "  El backend está listo y congelado."
  echo "=========================================================="
  exit 0
else
  echo "  ⚠️ ALGUNAS COMPROBACIONES FALLARON."
  echo "=========================================================="
  exit 1
fi
