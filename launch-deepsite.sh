#!/bin/bash

# Script simplificado para iniciar DeepSite Locally
# Autor: Alexander Oviedo Fadul

# Ruta al proyecto DeepSite Locally
PROJECT_DIR="/Volumes/NVMe1TB/GitHub/deepsite-locally"
LOG_FILE="$HOME/Library/Logs/DeepSite.log"

# Registrar información de inicio
echo "$(date): Script de inicio simplificado ejecutado" >> "$LOG_FILE"
echo "Usuario actual: $(whoami)" >> "$LOG_FILE"
echo "Directorio actual: $(pwd)" >> "$LOG_FILE"

# Cambiar al directorio del proyecto
cd "$PROJECT_DIR" || {
    echo "$(date): ERROR - No se pudo cambiar al directorio del proyecto: $PROJECT_DIR" >> "$LOG_FILE"
    exit 1
}

# Iniciar el servidor usando npm start
echo "$(date): Iniciando servidor npm..." >> "$LOG_FILE"
/usr/local/bin/npm start >> "$LOG_FILE" 2>&1 &

# Guardar el PID
echo $! > "$HOME/Library/Logs/deepsite.pid"
echo "$(date): PID del servidor: $(cat $HOME/Library/Logs/deepsite.pid)" >> "$LOG_FILE"

exit 0
