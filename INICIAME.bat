@echo off
title APU-05 // Analizador Cualitativo
echo Iniciando servidor local para APU-05...
echo.
echo 1. Abriendo navegador en http://localhost:8000
start http://localhost:8000
echo 2. Iniciando Python Server...
python serve.py
pause
