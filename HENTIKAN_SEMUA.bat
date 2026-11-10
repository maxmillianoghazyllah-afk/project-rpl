@echo off
title Menutup Semua Server Kantin
echo Menutup seluruh proses Node.js dan CMD Kantin...
taskkill /F /IM node.exe >nul 2>&1
echo Selesai! Semua window server sudah dimatikan.
timeout /t 2 >nul
