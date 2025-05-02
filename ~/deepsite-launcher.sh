#!/bin/bash

# Script para iniciar DeepSite Locally desde el directorio de inicio del usuario
# Autor: Alexander Oviedo Fadul

# Ruta al proyecto DeepSite Locally
PROJECT_DIR="/Volumes/NVMe1TB/GitHub/deepsite-locally"
LOG_FILE="$HOME/Library/Logs/DeepSite.log"

# Registrar información de inicio
echo "$(date): Script de inicio desde directorio de usuario ejecutado" >> "$LOG_FILE"
echo "Usuario actual: $(whoami)" >> "$LOG_FILE"
echo "Directorio actual: $(pwd)" >> "$LOG_FILE"

# Verificar si el directorio del proyecto existe
if [ ! -d "$PROJECT_DIR" ]; then
    echo "$(date): ERROR - El directorio del proyecto no existe: $PROJECT_DIR" >> "$LOG_FILE"
    exit 1
fi

# Cambiar al directorio del proyecto
cd "$PROJECT_DIR" || {
    echo "$(date): ERROR - No se pudo cambiar al directorio del proyecto: $PROJECT_DIR" >> "$LOG_FILE"
    exit 1
}

# Verificar si el servidor ya está en ejecución
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    echo "$(date): DeepSite Locally ya está en ejecución." >> "$LOG_FILE"
    exit 0
fi

# Iniciar el servidor
echo "$(date): Iniciando DeepSite Locally..." >> "$LOG_FILE"

# Usar nohup para que el proceso continúe incluso si el script termina
/usr/local/bin/npm start >> "$LOG_FILE" 2>&1 &

# Guardar el PID del proceso
echo $! > "$HOME/Library/Logs/deepsite.pid"
echo "$(date): PID del servidor: $(cat $HOME/Library/Logs/deepsite.pid)" >> "$LOG_FILE"

exit 0
