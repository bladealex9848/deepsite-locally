#!/bin/bash

# Script para configurar el inicio automático de DeepSite Locally en macOS
# Autor: Alexander Oviedo Fadul

# Definir colores para los mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Ruta al proyecto DeepSite Locally - ACTUALIZADA PARA TU SISTEMA
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

# Verificar si el script de inicio existe
if [ ! -f "$PROJECT_DIR/start-deepsite.sh" ]; then
    print_error "El script de inicio no existe: $PROJECT_DIR/start-deepsite.sh"
    print_message "Por favor, asegúrate de que el script start-deepsite.sh existe en el directorio del proyecto."
    exit 1
fi

# Hacer el script de inicio ejecutable
chmod +x "$PROJECT_DIR/start-deepsite.sh"

# Crear el archivo plist para launchd
PLIST_FILE="$HOME/Library/LaunchAgents/com.deepsite.locally.plist"
PLIST_DIR="$HOME/Library/LaunchAgents"

# Crear el directorio LaunchAgents si no existe
if [ ! -d "$PLIST_DIR" ]; then
    mkdir -p "$PLIST_DIR"
fi

# Crear el archivo plist
cat > "$PLIST_FILE" << EOL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.deepsite.locally</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>${PROJECT_DIR}/start-deepsite.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <false/>
    <key>StandardOutPath</key>
    <string>${HOME}/Library/Logs/DeepSite.log</string>
    <key>StandardErrorPath</key>
    <string>${HOME}/Library/Logs/DeepSite.log</string>
</dict>
</plist>
EOL

# Cargar el archivo plist
launchctl load -w "$PLIST_FILE"

print_message "DeepSite Locally se ha configurado para iniciar automáticamente al arrancar el sistema."
print_message "Logs disponibles en: $HOME/Library/Logs/DeepSite.log"
print_message "Para desactivar el inicio automático, ejecuta: launchctl unload -w $PLIST_FILE"
