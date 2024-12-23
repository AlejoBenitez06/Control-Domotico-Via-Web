#!/bin/bash
#Servicios.sh

# Esperar un minuto antes de iniciar
echo "Esperando 2 minuto antes de iniciar..."
sleep 120

# Una vez conectados, iniciar el frontend
echo "Conexión establecida. Iniciando Frontend..."
cd "/home/Alejo/Desktop/casa domotica/Frontend"
npm start &

# Iniciar el backend
echo "Iniciando Backend..."
cd "/home/Alejo/Desktop/casa domotica/backend/server"
source myenv/bin/activate
python3 server.py &
