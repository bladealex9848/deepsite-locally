# Configuración de inicio automático para DeepSite Locally

Este documento proporciona instrucciones detalladas para configurar DeepSite Locally para que se inicie automáticamente al arrancar tu sistema, tanto en macOS como en Windows.

## Índice

1. [Requisitos previos](#requisitos-previos)
2. [Configuración en macOS](#configuración-en-macos)
3. [Configuración en Windows](#configuración-en-windows)
4. [Solución de problemas](#solución-de-problemas)
5. [Desactivar el inicio automático](#desactivar-el-inicio-automático)

## Requisitos previos

Antes de configurar el inicio automático, asegúrate de tener instalado:

- Node.js (versión 14 o superior)
- npm (normalmente viene con Node.js)
- Git (opcional, para clonar el repositorio)

## Configuración en macOS

### Método 1: Usando el script de configuración automática

1. Abre Terminal.
2. Navega al directorio del proyecto:
   ```bash
   cd /ruta/a/deepsite-locally
   ```
3. Edita el archivo `setup-autostart-mac.sh` para actualizar la variable `PROJECT_DIR` con la ruta correcta a tu proyecto:
   ```bash
   nano setup-autostart-mac.sh
   ```
4. Haz el script ejecutable:
   ```bash
   chmod +x setup-autostart-mac.sh
   ```
5. Ejecuta el script:
   ```bash
   ./setup-autostart-mac.sh
   ```
6. Ingresa tu contraseña si se te solicita.

### Método 2: Configuración manual

1. Abre Terminal.
2. Navega al directorio del proyecto:
   ```bash
   cd /ruta/a/deepsite-locally
   ```
3. Edita el archivo `start-deepsite.sh` para actualizar la variable `PROJECT_DIR` con la ruta correcta a tu proyecto:
   ```bash
   nano start-deepsite.sh
   ```
4. Haz el script ejecutable:
   ```bash
   chmod +x start-deepsite.sh
   ```
5. Crea un archivo plist en `~/Library/LaunchAgents`:
   ```bash
   nano ~/Library/LaunchAgents/com.deepsite.locally.plist
   ```
6. Copia y pega el siguiente contenido, reemplazando `/ruta/a/deepsite-locally` con la ruta correcta a tu proyecto:
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
   <plist version="1.0">
   <dict>
       <key>Label</key>
       <string>com.deepsite.locally</string>
       <key>ProgramArguments</key>
       <array>
           <string>/bin/bash</string>
           <string>/ruta/a/deepsite-locally/start-deepsite.sh</string>
       </array>
       <key>RunAtLoad</key>
       <true/>
       <key>KeepAlive</key>
       <false/>
       <key>StandardOutPath</key>
       <string>~/Library/Logs/DeepSite.log</string>
       <key>StandardErrorPath</key>
       <string>~/Library/Logs/DeepSite.log</string>
   </dict>
   </plist>
   ```
7. Carga el archivo plist:
   ```bash
   launchctl load -w ~/Library/LaunchAgents/com.deepsite.locally.plist
   ```

## Configuración en Windows

### Método 1: Usando el script de configuración automática

1. Abre el Explorador de archivos y navega al directorio del proyecto.
2. Edita el archivo `setup-autostart-windows.bat` con el Bloc de notas para actualizar la variable `PROJECT_DIR` con la ruta correcta a tu proyecto.
3. Haz clic derecho en `setup-autostart-windows.bat` y selecciona "Ejecutar como administrador".
4. Sigue las instrucciones en pantalla.

### Método 2: Configuración manual

1. Abre el Explorador de archivos y navega al directorio del proyecto.
2. Edita el archivo `start-deepsite.bat` con el Bloc de notas para actualizar la variable `PROJECT_DIR` con la ruta correcta a tu proyecto.
3. Presiona `Win + R`, escribe `shell:startup` y presiona Enter para abrir la carpeta de inicio.
4. Crea un acceso directo a `start-deepsite.bat` en esta carpeta:
   - Haz clic derecho en un espacio vacío y selecciona "Nuevo" > "Acceso directo".
   - En la ubicación del elemento, escribe la ruta completa a `start-deepsite.bat`, por ejemplo: `C:\ruta\a\deepsite-locally\start-deepsite.bat`.
   - Haz clic en "Siguiente" y asigna un nombre al acceso directo, por ejemplo: "DeepSite Locally".
   - Haz clic en "Finalizar".

## Solución de problemas

### macOS

- **Problema**: El servicio no se inicia automáticamente.
  - **Solución**: Verifica los logs en `~/Library/Logs/DeepSite.log`.
  - **Solución alternativa**: Ejecuta `launchctl list | grep deepsite` para verificar si el servicio está cargado.

- **Problema**: Error de permisos.
  - **Solución**: Asegúrate de que los scripts tienen permisos de ejecución: `chmod +x start-deepsite.sh`.

### Windows

- **Problema**: El script no se ejecuta al iniciar Windows.
  - **Solución**: Verifica que el acceso directo está en la carpeta de inicio (`shell:startup`).
  - **Solución alternativa**: Ejecuta el script manualmente para verificar si hay errores.

- **Problema**: Error "El sistema no puede encontrar la ruta especificada".
  - **Solución**: Asegúrate de que la variable `PROJECT_DIR` en el script apunta a la ubicación correcta del proyecto.

## Desactivar el inicio automático

### macOS

Para desactivar el inicio automático en macOS:

```bash
launchctl unload -w ~/Library/LaunchAgents/com.deepsite.locally.plist
```

Para eliminar completamente la configuración:

```bash
rm ~/Library/LaunchAgents/com.deepsite.locally.plist
```

### Windows

Para desactivar el inicio automático en Windows:

1. Presiona `Win + R`, escribe `shell:startup` y presiona Enter.
2. Elimina el acceso directo "DeepSite Locally" de la carpeta.

## Acceso a la aplicación

Una vez configurado el inicio automático, DeepSite Locally estará disponible en:

```
http://localhost:5173
```

Simplemente abre tu navegador y navega a esta dirección para acceder a la aplicación.

---

Si tienes alguna pregunta o problema, por favor crea un issue en el repositorio del proyecto o contacta al autor.

Autor: Alexander Oviedo Fadul
