#!/bin/bash

# Script de desarrollo para Bizuit Form Template
# Facilita el trabajo con múltiples paquetes

set -e

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

print_success() {
    echo -e "${GREEN}✓ ${1}${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

# Ayuda
show_help() {
    cat << EOF
Uso: ./dev.sh [comando]

Comandos disponibles:

  install         Instala todas las dependencias
  build           Compila todos los paquetes
  dev             Inicia el servidor de desarrollo del ejemplo
  clean           Limpia node_modules y archivos compilados
  rebuild         Limpia y reconstruye todo
  help            Muestra esta ayuda

Ejemplos:
  ./dev.sh install
  ./dev.sh build
  ./dev.sh dev

EOF
}

# Instalar dependencias
install_deps() {
    print_info "Instalando dependencias..."

    print_info "Instalando SDK..."
    cd packages/bizuit-form-sdk
    npm install
    cd ../..
    print_success "SDK instalado"

    print_info "Instalando UI Components..."
    cd packages/bizuit-ui-components
    npm install
    cd ../..
    print_success "UI Components instalados"

    print_info "Instalando ejemplo..."
    cd example
    npm install
    cd ..
    print_success "Ejemplo instalado"

    print_success "Todas las dependencias instaladas correctamente"
}

# Compilar paquetes
build_packages() {
    print_info "Compilando paquetes..."

    print_info "Compilando SDK..."
    cd packages/bizuit-form-sdk
    npm run build
    cd ../..
    print_success "SDK compilado"

    print_info "Compilando UI Components..."
    cd packages/bizuit-ui-components
    npm run build
    cd ../..
    print_success "UI Components compilados"

    print_success "Todos los paquetes compilados correctamente"
}

# Servidor de desarrollo
dev_server() {
    print_info "Iniciando servidor de desarrollo..."
    print_warning "Asegúrate de haber compilado los paquetes primero (./dev.sh build)"

    cd example
    npm run dev
}

# Limpiar
clean() {
    print_info "Limpiando proyecto..."

    print_info "Limpiando SDK..."
    cd packages/bizuit-form-sdk
    rm -rf node_modules dist
    cd ../..

    print_info "Limpiando UI Components..."
    cd packages/bizuit-ui-components
    rm -rf node_modules dist
    cd ../..

    print_info "Limpiando ejemplo..."
    cd example
    rm -rf node_modules .next
    cd ..

    print_success "Proyecto limpio"
}

# Reconstruir todo
rebuild() {
    clean
    install_deps
    build_packages
    print_success "Proyecto reconstruido completamente"
}

# Main
case "${1:-}" in
    install)
        install_deps
        ;;
    build)
        build_packages
        ;;
    dev)
        dev_server
        ;;
    clean)
        clean
        ;;
    rebuild)
        rebuild
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        show_help
        exit 1
        ;;
esac
