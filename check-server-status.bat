@echo off
:: Script para verificar el estado del servidor DeepSite Locally
:: Autor: Alexander Oviedo Fadul

echo [DeepSite] Verificando estado del servidor...

:: Verificar si el puerto 5173 está en uso
netstat -ano | findstr :5173 | findstr LISTENING >nul
if %ERRORLEVEL% equ 0 (
    echo [DeepSite] DeepSite Locally está en ejecución.
    echo [DeepSite] Accede a la aplicación en: http://localhost:5173
    
    :: Mostrar información del proceso
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
        set PID=%%a
        echo [DeepSite] PID del proceso: %%a
        
        :: Mostrar información del proceso
        tasklist /fi "PID eq %%a" /fo list | findstr "Nombre de imagen:"
    )
    
    :: Preguntar si desea detener el servidor
    set /p STOP_SERVER="¿Deseas detener el servidor? (S/N): "
    if /i "%STOP_SERVER%"=="S" (
        echo [DeepSite] Deteniendo el servidor...
        taskkill /F /PID %PID%
        echo [DeepSite] Servidor detenido.
    )
) else (
    echo [DeepSite Error] DeepSite Locally no está en ejecución.
    
    :: Preguntar si desea iniciar el servidor
    set /p START_SERVER="¿Deseas iniciar el servidor? (S/N): "
    if /i "%START_SERVER%"=="S" (
        echo [DeepSite] Iniciando DeepSite Locally...
        
        :: Ruta al proyecto DeepSite Locally
        :: IMPORTANTE: Actualiza esta ruta con la ubicación correcta en tu sistema
        set PROJECT_DIR=C:\GitHub\deepsite-locally
        
        :: Verificar si el directorio del proyecto existe
        if not exist "%PROJECT_DIR%" (
            echo [DeepSite Error] El directorio del proyecto no existe: %PROJECT_DIR%
            echo [DeepSite] Por favor, actualiza la variable PROJECT_DIR en este script con la ruta correcta.
            pause
            exit /b 1
        )
        
        :: Cambiar al directorio del proyecto
        cd /d "%PROJECT_DIR%"
        
        :: Iniciar el servidor
        start /B npm start
        
        :: Esperar a que el servidor esté listo
        timeout /t 3 >nul
        
        :: Verificar si el servidor se inició correctamente
        netstat -ano | findstr :5173 | findstr LISTENING >nul
        if %ERRORLEVEL% equ 0 (
            echo [DeepSite] DeepSite Locally se ha iniciado correctamente.
            echo [DeepSite] Accede a la aplicación en: http://localhost:5173
            
            :: Abrir el navegador
            start http://localhost:5173
        ) else (
            echo [DeepSite Error] No se pudo iniciar DeepSite Locally.
            echo [DeepSite] Por favor, verifica los logs para más información.
        )
    )
)

pause
