@echo off
title Havan - Loja Online
cd /d "%~dp0"

echo ========================================
echo   Iniciando loja Havan...
echo ========================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado.
    echo Baixe e instale em: https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo Abrindo o site no navegador...
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000"

cd server
if not exist node_modules (
    echo Instalando dependencias...
    call npm install
)

echo.
echo Loja rodando em http://localhost:3000
echo Mantenha esta janela aberta enquanto usa a loja.
echo Para encerrar, feche esta janela ou pressione Ctrl+C.
echo.

node index.js
pause
