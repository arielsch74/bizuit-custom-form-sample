#!/bin/bash

# Script para configurar forms-examples como Git submodule
# Uso: ./setup-forms-submodule.sh

set -e  # Exit on error

REPO_URL="https://github.com/arielsch74/bizuit-custom-form-sample.git"
FORMS_DIR="forms-examples"
BACKUP_DIR="forms-examples-backup"
TEMP_DIR="/tmp/bizuit-custom-form-sample-temp"

echo "🚀 Configurando forms-examples como Git submodule"
echo "=================================================="
echo ""

# Paso 1: Verificar que el repo externo existe
echo "📡 Verificando repositorio externo..."
if ! git ls-remote "$REPO_URL" &> /dev/null; then
    echo "❌ Error: El repositorio $REPO_URL no existe o no es accesible"
    echo ""
    echo "Por favor:"
    echo "1. Crea el repositorio en GitHub: https://github.com/arielsch74"
    echo "2. Asegúrate de que sea privado o público según tu preferencia"
    echo "3. NO inicialices con README (debe estar vacío)"
    echo ""
    exit 1
fi

echo "✅ Repositorio existe y es accesible"
echo ""

# Paso 2: Hacer backup del directorio actual
echo "💾 Haciendo backup de forms-examples..."
if [ -d "$FORMS_DIR" ]; then
    if [ -d "$BACKUP_DIR" ]; then
        rm -rf "$BACKUP_DIR"
    fi
    mv "$FORMS_DIR" "$BACKUP_DIR"
    echo "✅ Backup creado: $BACKUP_DIR"
else
    echo "⚠️  Directorio $FORMS_DIR no existe, se creará uno nuevo"
fi
echo ""

# Paso 3: Crear directorio temporal y copiar contenido
echo "📦 Preparando contenido para el nuevo repo..."
if [ -d "$TEMP_DIR" ]; then
    rm -rf "$TEMP_DIR"
fi

mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"

# Copiar contenido del backup
if [ -d "$OLDPWD/$BACKUP_DIR" ]; then
    cp -r "$OLDPWD/$BACKUP_DIR/"* .
    echo "✅ Contenido copiado desde backup"
else
    echo "⚠️  No hay backup, creando estructura base..."
fi
echo ""

# Paso 4: Inicializar repo Git y push
echo "📤 Inicializando repo y haciendo push..."
git init
git add .
git commit -m "Initial commit: Custom forms samples with GitHub Actions workflow"

# Configurar remote
git remote add origin "$REPO_URL"

# Push
git branch -M main
if git push -u origin main; then
    echo "✅ Push exitoso al repo externo"
else
    echo "❌ Error al hacer push. Verifica:"
    echo "  - Que tienes permisos de escritura"
    echo "  - Que el repo está vacío"
    echo "  - Tus credenciales de Git"
    exit 1
fi
echo ""

# Paso 5: Volver al repo principal y agregar submodule
echo "🔗 Agregando submodule al repo principal..."
cd "$OLDPWD"

# Agregar submodule
if git submodule add "$REPO_URL" "$FORMS_DIR"; then
    echo "✅ Submodule agregado exitosamente"
else
    echo "❌ Error al agregar submodule"
    exit 1
fi
echo ""

# Paso 6: Commit en el repo principal
echo "💾 Commiteando cambios en el repo principal..."
git add .gitmodules "$FORMS_DIR"

if git commit -m "Add forms-examples as Git submodule

- Forms moved to separate repository: $REPO_URL
- Allows independent CI/CD for custom forms
- GitHub Actions workflow for deployment package generation"; then
    echo "✅ Commit exitoso en repo principal"
else
    echo "⚠️  Nada que commitear (quizás ya estaba commiteado)"
fi
echo ""

# Paso 7: Verificación
echo "✅ Verificando configuración..."
echo ""
echo "Submodule status:"
git submodule status
echo ""

echo "Contenido de .gitmodules:"
cat .gitmodules
echo ""

echo "Contenido de forms-examples:"
ls -la "$FORMS_DIR" | head -10
echo ""

# Paso 8: Cleanup
echo "🧹 Limpieza..."
rm -rf "$TEMP_DIR"
echo "✅ Directorio temporal eliminado"
echo ""

# Instrucciones finales
echo "🎉 ¡Configuración completada!"
echo ""
echo "📋 Próximos pasos:"
echo ""
echo "1. Push al repo principal:"
echo "   git push origin main"
echo ""
echo "2. Para trabajar en forms:"
echo "   cd $FORMS_DIR"
echo "   # Hacer cambios"
echo "   git add ."
echo "   git commit -m 'feat: add new form'"
echo "   git push origin main"
echo "   cd .."
echo "   git add $FORMS_DIR"
echo "   git commit -m 'Update forms-examples submodule'"
echo "   git push"
echo ""
echo "3. Para clonar el proyecto con submodules:"
echo "   git clone --recursive <repo-url>"
echo ""
echo "4. Para actualizar submodule:"
echo "   cd $FORMS_DIR && git pull origin main && cd .."
echo "   git add $FORMS_DIR && git commit -m 'Update submodule' && git push"
echo ""
echo "✨ El GitHub Action en forms-examples se ejecutará automáticamente"
echo "   cuando hagas push de nuevos forms."
echo ""
