#!/bin/bash

# Script para verificar el estado del servidor DeepSite Locally
# Autor: Alexander Oviedo Fadul

# Definir colores para los mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Estado de DeepSite Locally ===${NC}"

# Verificar si el servidor está en ejecución
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${GREEN}✅ DeepSite Locally está en ejecución.${NC}"
    echo -e "Accede a la aplicación en: ${YELLOW}http://localhost:5173${NC}"
    
    # Mostrar información del proceso
    PID=$(lsof -Pi :5173 -sTCP:LISTEN -t)
    echo -e "PID del servidor: ${GREEN}$PID${NC}"
    
    # Mostrar tiempo de ejecución
    if [ -n "$PID" ]; then
        PROCESS_START=$(ps -p $PID -o lstart=)
        echo -e "Iniciado el: ${GREEN}$PROCESS_START${NC}"
    fi
else
    echo -e "${RED}❌ DeepSite Locally no está en ejecución.${NC}"
    echo -e "Para iniciar el servidor, ejecuta: ${YELLOW}npm start${NC}"
fi

# Verificar el estado del LaunchAgent
if launchctl list | grep -q "com.deepsite.locally"; then
    AGENT_STATUS=$(launchctl list | grep "com.deepsite.locally" | awk '{print $1}')
    if [ "$AGENT_STATUS" == "-" ] || [ "$AGENT_STATUS" == "0" ]; then
        echo -e "${GREEN}✅ El servicio de inicio automático está configurado correctamente.${NC}"
    else
        echo -e "${RED}❌ El servicio de inicio automático está configurado pero tiene un error (código: $AGENT_STATUS).${NC}"
        echo -e "Revisa los logs en: ${YELLOW}$HOME/Library/Logs/DeepSite.log${NC}"
    fi
else
    echo -e "${RED}❌ El servicio de inicio automático no está configurado.${NC}"
    echo -e "Para configurarlo, ejecuta: ${YELLOW}./setup-autostart-mac.sh${NC}"
fi
