#!/bin/bash

# Script para ejecutar tests de integración Python vs .NET
# Requiere que ambos backends estén corriendo

set -e

echo "========================================="
echo "BIZUIT Custom Forms - Integration Tests"
echo "Python vs .NET Backend Comparison"
echo "========================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que Python backend esté corriendo (puerto 8000)
echo "Verificando Python backend (puerto 8000)..."
if ! curl -s http://localhost:8000/ > /dev/null 2>&1; then
    echo -e "${RED}❌ Python backend NO está corriendo en puerto 8000${NC}"
    echo ""
    echo "Para iniciar Python backend:"
    echo "  cd custom-forms/backend-api"
    echo "  source venv/bin/activate"
    echo "  python main.py"
    echo ""
    exit 1
fi
echo -e "${GREEN}✓ Python backend OK${NC}"

# Verificar que .NET backend esté corriendo (puerto 8001)
echo "Verificando .NET backend (puerto 8001)..."
if ! curl -s http://localhost:8001/ > /dev/null 2>&1; then
    echo -e "${RED}❌ .NET backend NO está corriendo en puerto 8001${NC}"
    echo ""
    echo "Para iniciar .NET backend:"
    echo "  cd custom-forms/backend-api-dotnet/BizuitCustomForms.WebApi"
    echo "  dotnet run"
    echo ""
    exit 1
fi
echo -e "${GREEN}✓ .NET backend OK${NC}"

echo ""
echo "========================================="
echo "Ejecutando tests de integración..."
echo "========================================="
echo ""

# Ejecutar tests
cd custom-forms/backend-api-dotnet

dotnet test \
    --filter "FullyQualifiedName~Integration" \
    --logger "console;verbosity=detailed" \
    --results-directory ./TestResults \
    --collect:"XPlat Code Coverage"

TEST_RESULT=$?

echo ""
echo "========================================="
if [ $TEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ TODOS LOS TESTS PASARON${NC}"
    echo "========================================="
    echo ""
    echo "Resultados guardados en: ./TestResults/"
    echo ""
    echo -e "${GREEN}Backend .NET es compatible con Python!${NC}"
    exit 0
else
    echo -e "${RED}❌ ALGUNOS TESTS FALLARON${NC}"
    echo "========================================="
    echo ""
    echo "Revisa los logs arriba para ver qué falló."
    echo "Resultados guardados en: ./TestResults/"
    echo ""
    echo -e "${YELLOW}Backend .NET requiere ajustes para ser compatible${NC}"
    exit 1
fi
