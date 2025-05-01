@echo off
:: Script para configurar el inicio automático de DeepSite Locally en Windows
:: Autor: Alexander Oviedo Fadul

echo [DeepSite] Configurando inicio automático para DeepSite Locally...

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

:: Verificar si el script de inicio existe
if not exist "%PROJECT_DIR%\start-deepsite.bat" (
    echo [DeepSite Error] El script de inicio no existe: %PROJECT_DIR%\start-deepsite.bat
    echo [DeepSite] Por favor, asegúrate de que el script start-deepsite.bat existe en el directorio del proyecto.
    pause
    exit /b 1
)

:: Crear un acceso directo en la carpeta de inicio
echo [DeepSite] Creando acceso directo en la carpeta de inicio...

:: Ruta a la carpeta de inicio
set STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup

:: Crear el acceso directo usando PowerShell
powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%STARTUP_FOLDER%\DeepSite Locally.lnk'); $Shortcut.TargetPath = '%PROJECT_DIR%\start-deepsite.bat'; $Shortcut.WorkingDirectory = '%PROJECT_DIR%'; $Shortcut.Description = 'Iniciar DeepSite Locally'; $Shortcut.Save()"

if %ERRORLEVEL% equ 0 (
    echo [DeepSite] DeepSite Locally se ha configurado para iniciar automáticamente al arrancar el sistema.
    echo [DeepSite] Acceso directo creado en: %STARTUP_FOLDER%\DeepSite Locally.lnk
) else (
    echo [DeepSite Error] No se pudo crear el acceso directo.
    echo [DeepSite] Por favor, intenta ejecutar este script como administrador.
    pause
    exit /b 1
)

:: Preguntar si desea iniciar DeepSite Locally ahora
echo.
set /p START_NOW="¿Deseas iniciar DeepSite Locally ahora? (S/N): "
if /i "%START_NOW%"=="S" (
    echo [DeepSite] Iniciando DeepSite Locally...
    call "%PROJECT_DIR%\start-deepsite.bat"
) else (
    echo [DeepSite] DeepSite Locally se iniciará automáticamente la próxima vez que inicies Windows.
)

pause
