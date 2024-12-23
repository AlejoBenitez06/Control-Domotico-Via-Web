#!/bin/bash
#start_services.sh
# Esperar hasta que haya una conexión a Internet
while ! ping -c 1 -W 1 8.8.8.8; do
  echo "Esperando conexión a Internet..."
  sleep 5
done 

# Enviar la IP por correo usando msmtp
echo "Enviando IP por correo..."
echo -e "To: alejomaxibenitez06@gmail.com\nFrom: monarkhousedomotic@gmail.com\nSubject: Ip de la Pagina web\n\nLa IP es: $(hostname -I)" | msmtp alejomaxibenitez06@gmail.com

echo "Servicios iniciados correctamente."
