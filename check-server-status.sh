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

# Verificar si el puerto 5173 está en uso
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    print_message "DeepSite Locally está en ejecución."
    print_message "Accede a la aplicación en: http://localhost:5173"

    # Mostrar información del proceso
    PID=$(lsof -Pi :5173 -sTCP:LISTEN -t)
    print_message "PID del proceso: $PID"

    # Mostrar tiempo de ejecución
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        START_TIME=$(ps -p $PID -o lstart= 2>/dev/null)
        if [ ! -z "$START_TIME" ]; then
            print_message "Iniciado en: $START_TIME"
        fi
    else
        # Linux
        START_TIME=$(ps -p $PID -o lstart= 2>/dev/null)
        if [ ! -z "$START_TIME" ]; then
            print_message "Iniciado en: $START_TIME"
        fi
    fi

    # Preguntar si desea detener el servidor
    read -p "¿Deseas detener el servidor? (s/n): " STOP_SERVER
    if [[ $STOP_SERVER == "s" || $STOP_SERVER == "S" ]]; then
        print_message "Deteniendo el servidor..."
        kill -9 $PID
        print_message "Servidor detenido."
    fi
else
    print_error "DeepSite Locally no está en ejecución."

    # Preguntar si desea iniciar el servidor
    read -p "¿Deseas iniciar el servidor? (s/n): " START_SERVER
    if [[ $START_SERVER == "s" || $START_SERVER == "S" ]]; then
        print_message "Iniciando DeepSite Locally..."

        # Ruta al proyecto DeepSite Locally
        PROJECT_DIR="/Volumes/NVMe1TB/GitHub/deepsite-locally"

        # Verificar si el directorio del proyecto existe
        if [ ! -d "$PROJECT_DIR" ]; then
            print_error "El directorio del proyecto no existe: $PROJECT_DIR"
            print_message "Por favor, actualiza la variable PROJECT_DIR en este script con la ruta correcta."
            exit 1
        fi

        # Cambiar al directorio del proyecto
        cd "$PROJECT_DIR"

        # Iniciar el servidor
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
    fi
fi
