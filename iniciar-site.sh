#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

echo "========================================"
echo "  Iniciando loja Havan..."
echo "========================================"

if ! command -v node >/dev/null 2>&1; then
    echo "[ERRO] Node.js não encontrado. Instale em https://nodejs.org"
    exit 1
fi

(
    sleep 2
    if command -v xdg-open >/dev/null 2>&1; then
        xdg-open "http://localhost:3000" >/dev/null 2>&1 || true
    elif command -v open >/dev/null 2>&1; then
        open "http://localhost:3000" >/dev/null 2>&1 || true
    fi
) &

cd server
if [ ! -d node_modules ]; then
    echo "Instalando dependências..."
    npm install
fi

echo ""
echo "Loja rodando em http://localhost:3000"
echo "Mantenha este terminal aberto enquanto usa a loja."
echo ""

node index.js
