@echo off
setlocal
cd /d "%~dp0"
set "LAB_NODE=node"
where node >nul 2>nul
if errorlevel 1 (
  set "LAB_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
)
if not exist "node_modules\vite\bin\vite.js" (
  echo Primero instala las dependencias con npm install o pnpm install.
  pause
  exit /b 1
)
if "%~1"=="--comprobar" (
  "%LAB_NODE%" --version
  if errorlevel 1 exit /b 1
  "%LAB_NODE%" "node_modules\vite\bin\vite.js" --version
  exit /b
)
echo Laboratorio Virtual de Ondas
 echo Manten esta ventana abierta. Pulsa Ctrl+C para detener el servidor.
"%LAB_NODE%" "node_modules\vite\bin\vite.js" --host 127.0.0.1 --open
if errorlevel 1 (
  echo No se pudo iniciar. Instala Node.js 22 o posterior y vuelve a intentarlo.
  pause
)
