@echo off
:: Script para iniciar DeepSite Locally en Windows
:: Autor: Alexander Oviedo Fadul

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

:: Verificar si Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [DeepSite Error] Node.js no está instalado.
    echo [DeepSite] Por favor, instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

:: Verificar si npm está instalado
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [DeepSite Error] npm no está instalado.
    echo [DeepSite] Por favor, instala npm (normalmente viene con Node.js).
    pause
    exit /b 1
)

:: Verificar si el puerto 5173 está disponible
netstat -ano | findstr :5173 | findstr LISTENING >nul
if %ERRORLEVEL% equ 0 (
    echo [DeepSite Advertencia] El puerto 5173 ya está en uso.
    echo [DeepSite] Intentando detener el proceso que usa el puerto 5173...
    
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
        taskkill /F /PID %%a
    )
    
    timeout /t 2 >nul
)

:: Iniciar el servidor
echo [DeepSite] Iniciando DeepSite Locally...
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
    pause
)
