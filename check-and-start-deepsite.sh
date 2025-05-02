#!/bin/bash

# Script para verificar y reiniciar DeepSite Locally si es necesario
# Autor: Alexander Oviedo Fadul

# Definir colores para los mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Ruta al proyecto DeepSite Locally
PROJECT_DIR="/Volumes/NVMe1TB/GitHub/deepsite-locally"
LOG_FILE="$HOME/Library/Logs/DeepSite.log"
PID_FILE="$HOME/Library/Logs/deepsite.pid"

# Función para mostrar mensajes
print_message() {
    echo -e "${GREEN}[DeepSite]${NC} $1"
    echo "$(date): $1" >> "$LOG_FILE"
}

print_error() {
    echo -e "${RED}[DeepSite Error]${NC} $1"
    echo "$(date): ERROR - $1" >> "$LOG_FILE"
}

print_warning() {
    echo -e "${YELLOW}[DeepSite Advertencia]${NC} $1"
    echo "$(date): ADVERTENCIA - $1" >> "$LOG_FILE"
}

# Registrar información de inicio
print_message "Verificando estado de DeepSite Locally..."

# Verificar si el directorio del proyecto existe
if [ ! -d "$PROJECT_DIR" ]; then
    print_error "El directorio del proyecto no existe: $PROJECT_DIR"
    exit 1
fi

# Cambiar al directorio del proyecto
cd "$PROJECT_DIR" || {
    print_error "No se pudo cambiar al directorio del proyecto: $PROJECT_DIR"
    exit 1
}

# Verificar si el servidor está en ejecución
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    print_message "DeepSite Locally ya está en ejecución."
    exit 0
fi

# Si llegamos aquí, el servidor no está en ejecución
print_warning "DeepSite Locally no está en ejecución. Intentando iniciar..."

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado."
    exit 1
fi

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado."
    exit 1
fi

# Iniciar el servidor
print_message "Iniciando DeepSite Locally..."

# Usar nohup para que el proceso continúe incluso si el script termina
nohup npm start >> "$LOG_FILE" 2>&1 &

# Guardar el PID del proceso
echo $! > "$PID_FILE"
print_message "PID del servidor: $(cat $PID_FILE)"

# Esperar a que el servidor esté listo
sleep 5

# Verificar si el servidor se inició correctamente
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    print_message "DeepSite Locally se ha iniciado correctamente."
    print_message "Accede a la aplicación en: http://localhost:5173"
else
    print_error "No se pudo iniciar DeepSite Locally."
    print_message "Por favor, verifica los logs para más información: $LOG_FILE"
    exit 1
fi

exit 0
