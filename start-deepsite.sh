#!/bin/bash

# Script para iniciar DeepSite Locally en macOS
# Autor: Alexander Oviedo Fadul

# Definir colores para los mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Ruta al proyecto DeepSite Locally
PROJECT_DIR="/Volumes/NVMe1TB/GitHub/deepsite-locally"

# Función para mostrar mensajes
print_message() {
    echo -e "${GREEN}[DeepSite]${NC} $1"
}

print_error() {
    echo -e "${RED}[DeepSite Error]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[DeepSite Advertencia]${NC} $1"
}

# Verificar si el directorio del proyecto existe
if [ ! -d "$PROJECT_DIR" ]; then
    print_error "El directorio del proyecto no existe: $PROJECT_DIR"
    print_message "Por favor, actualiza la variable PROJECT_DIR en este script con la ruta correcta."
    exit 1
fi

# Cambiar al directorio del proyecto
cd "$PROJECT_DIR"

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado."
    print_message "Por favor, instala Node.js desde https://nodejs.org/"
    exit 1
fi

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado."
    print_message "Por favor, instala npm (normalmente viene con Node.js)."
    exit 1
fi

# Verificar si el puerto 5173 está disponible
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    print_warning "El puerto 5173 ya está en uso."
    print_message "Intentando detener el proceso que usa el puerto 5173..."
    lsof -ti:5173 | xargs kill -9
    sleep 2
fi

# Iniciar el servidor
print_message "Iniciando DeepSite Locally..."
npm start &

# Esperar a que el servidor esté listo
sleep 3

# Verificar si el servidor se inició correctamente
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    print_message "DeepSite Locally se ha iniciado correctamente."
    print_message "Accede a la aplicación en: http://localhost:5173"
    
    # Abrir el navegador (opcional)
    open "http://localhost:5173"
else
    print_error "No se pudo iniciar DeepSite Locally."
    print_message "Por favor, verifica los logs para más información."
fi
