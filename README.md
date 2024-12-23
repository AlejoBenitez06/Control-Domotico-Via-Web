1. README ACTUALIZADO
Casa Domótica Controlada a través de Página Web
Breve descripción:
Este proyecto es un sistema de automatización doméstica basado en una Raspberry Pi 3 B+ y un ESP8266, que permite el control remoto de dispositivos eléctricos, la monitorización de temperatura/humedad con un sensor AHT10, control de ingreso con RFID, luces exteriores automáticas y cierre automático de garaje. El sistema está compuesto por un frontend web desarrollado en React y un backend construido con Flask (Python), el cual se comunica con los pines GPIO de la Raspberry Pi para controlar distintos dispositivos, como módulos de relé, un sensor AHT10 para medir temperatura/humedad, el ESP8266 para ampliar el control de luces exteriores y un sensor ultrasónico, tarjetas RFID y servomotores.

Tabla de Contenidos
Descripción
Características
Arquitectura
Instalación
Uso
Configuración
Seguridad y Autenticación
Mantenimiento y Actualizaciones
Troubleshooting (Solución de Problemas)
Personalización y Escalabilidad
Integraciones Futuras
Licencia
Créditos
Descripción
Este proyecto es una aplicación de automatización doméstica avanzada que integra una Raspberry Pi 3 B+ (con un backend en Flask) y un módulo ESP8266. Permite a los usuarios controlar remotamente varios dispositivos eléctricos (luces, relés, estufas, aires acondicionados, etc.) y monitorizar la temperatura y humedad con un sensor AHT10, todo ello a través de una interfaz web intuitiva desarrollada en React.

El sistema incluye:

Control de relés para activar/desactivar aparatos.
Monitoreo de temperatura y humedad con un sensor AHT10.
Apertura y cierre automático de garaje mediante servomotores.
Control de luces exteriores y sensor ultrasónico usando ESP8266.
Registro y control de acceso mediante tarjetas RFID.
Descubrimiento de la Raspberry Pi vía mDNS (raspberrypi.local).
La meta es brindar un hogar inteligente, fácil de gestionar y seguro, permitiendo a los usuarios reducir esfuerzos manuales y ahorrar energía.

Características
Control remoto de dispositivos eléctricos
Mediante la aplicación web, se pueden encender/apagar luces, módulos de relé y accionar puertas automáticas (garaje).

Monitoreo de temperatura/humedad
Usa el sensor AHT10 para medir y mostrar datos en tiempo real en la interfaz web. Se pueden crear lógicas de encendido/apagado de equipos basadas en la temperatura o humedad.

Automatización del ingreso (RFID)
Se emplea un módulo RFID para registrar y controlar el acceso al hogar, aumentando la seguridad.

Luces exteriores automáticas
El ESP8266 controla las luces exteriores, pudiendo encenderlas o apagarlas según parámetros establecidos (horario, luminosidad, etc.) o manualmente desde la web.

Apertura/cierre de garaje
Mediante servomotores conectados al ESP8266, se puede accionar la puerta de garaje y programar su cierre automático en base a datos del sensor ultrasónico.

Seguridad y autenticación
La aplicación pide un usuario y contraseña para acceder a la interfaz web.

Interfaz web en React
Sencilla y responsiva, optimizada para navegadores de escritorio y dispositivos móviles.

Backend en Flask
Se encarga de gestionar la lógica de automatización y coordinar la comunicación en tiempo real con la Raspberry Pi y el ESP8266.

mDNS
Permite localizar la Raspberry Pi usando raspberrypi.local en vez de depender de una IP fija.

Facilidad de expansión
Se pueden añadir más sensores, dispositivos o módulos de ESP8266 sin alterar significativamente la estructura principal.

Arquitectura
Raspberry Pi 3 B+

Sistema operativo Raspbian OS.
Backend en Flask (controla GPIO, maneja lógica, MQTT opcional, etc.).
Se anuncia vía mDNS como raspberrypi.local para evitar IP fija.
ESP8266

Controla luces exteriores, servomotores y sensor ultrasónico.
Se conecta a la red Wi-Fi y se comunica con la Raspberry Pi (generalmente por MQTT o HTTP).
Frontend (React)

Interfaz amigable que consume la API Flask.
Permite visualizar y manipular el estado de dispositivos, y ver temperatura/humedad del AHT10.
Sensores y Actuadores

AHT10 para medir temperatura y humedad.
Módulos de relé para controlar luces, equipos de climatización, etc.
RFID para control de acceso.
Servomotores para puertas automáticas.
Sensor ultrasónico para detectar distancias al garaje o portón.
Instalación
Prerrequisitos
Raspberry Pi 3 B+ con Raspbian OS
Python 3 y pip3 instalados
Node.js v16.x y npm
React (17.x o superior)
Flask, Flask-SocketIO, Flask-CORS
RPi.GPIO (para Raspberry Pi)
ESP8266 con firmware adecuado
Conexión Wi-Fi y/o Ethernet en la misma red local
Pasos de Instalación
Configurar la Raspberry Pi
-----------------------------------
sudo apt-get update
sudo apt-get upgrade
sudo raspi-config
-----------------------------------
Habilita la interfaz GPIO, I2C (para el AHT10) si corresponde, y 1-Wire si tuvieras otros sensores.

Instalar dependencias de Python
-----------------------------------
sudo apt-get install python3 python3-pip
sudo pip3 install flask flask-socketio flask-cors RPi.GPIO
# Si usas MQTT, instala paho-mqtt o similares
--------------------------------------

Configurar el Backend (Flask)

Clona o descarga el repositorio en la Raspberry Pi.
Instala las dependencias en requirements.txt (si lo tienes) o manualmente.
Ejecuta python3 server.py y asegúrate de que escuche en 0.0.0.0.

Configurar el Frontend (React)
-----------------------------------
curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
cd <directorio-frontend>
npm install
npm start
-----------------------------------

Ajusta la IP y el puerto en el .env o package.json si es necesario.
Configurar el ESP8266

Conéctalo a la misma red Wi-Fi.
Asegúrate de que se comunique con raspberrypi.local (mDNS) o con la IP de la Raspberry Pi.
Acceder a la Aplicación

Desde cualquier navegador en la misma red, visita:
-----------------------------------
http://<ip-raspberrypi>:3000
-----------------------------------
O bien, si configuraste un nombre de host con mDNS, algo como:
-----------------------------------
http://raspberrypi.local:3000
-----------------------------------

Uso
Iniciar el Backend (Flask)
-----------------------------------
cd <directorio-backend>
python3 server.py
-----------------------------------

Iniciar el Frontend (React)
-----------------------------------
cd <directorio-frontend>
npm start
-----------------------------------

Control de Dispositivos
Loguéate con tus credenciales.
En la interfaz, podrás ver datos de temperatura/humedad del AHT10, encender/apagar relés, accionar servomotores, etc.
Registro RFID
Al pasar una tarjeta RFID, el ESP8266/RPi reconoce su ID y actúa según la configuración (p.ej., abrir puerta).
Configuración
Variables de Entorno (en un archivo .env en React):
-----------------------------------
API_URL=http://raspberrypi.local:3002
PORT=3000
-----------------------------------

Configuración del Backend (server.py):
-----------------------------------
if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=3002)
-----------------------------------

eguridad y Autenticación
Credenciales de Acceso: Guarda usuario/contraseña en un lugar seguro (variables de entorno, archivo de configuración).
HTTPS: Considera usar un proxy inverso (Nginx/Apache) con certificado SSL para cifrar el tráfico si accedes desde fuera de la LAN.
Control de Sesiones: Usa Flask-Login o JWT para manejar sesiones de usuario y evitar accesos no autorizados.
Mantenimiento y Actualizaciones
Actualizar Dependencias
-----------------------------------
pip3 install --upgrade -r requirements.txt
npm install
-----------------------------------

Logs y Diagnóstico
Revisar la salida de la consola donde corre Flask.
Para React, abre la consola del navegador o la terminal de npm start.
Firmware del ESP8266
Actualiza con herramientas como esptool.py o la IDE de Arduino, según sea tu flujo de trabajo.

Troubleshooting (Solución de Problemas)
mDNS no funciona
Comprueba si tienes instalado avahi-daemon en la Raspberry Pi y que esté corriendo.
El AHT10 no reporta datos
Verifica el cableado I2C (SDA, SCL), la dirección I2C y la librería de AHT10 en Python o en tu microcontrolador (ESP8266).
RFID no reconoce la tarjeta
Revisa la conexión SPI y el pin RST. Asegúrate de incluir la librería correcta (MFRC522).
No enciende el relé
Verifica si el relé necesita lógica invertida (HIGH para apagar, LOW para encender o viceversa).

Personalización y Escalabilidad
Añadir nuevos sensores (CO2, movimiento PIR, etc.) con más pines GPIO o usando otro ESP8266.
Integrar más lógicas (por ejemplo, encender luces según datos del AHT10 o según horarios).
Soporte multi-usuario con roles para restringir funciones.

Integraciones Futuras
Servicios en la nube (AWS, Azure, Firebase) para control remoto y registro histórico de datos.
Asistentes virtuales (Google Assistant, Alexa) para control por voz.
Notificaciones por correo, Telegram o SMS ante eventos (ej: cambio drástico de temperatura, acceso RFID no autorizado, etc.).

Licencia
Este proyecto se distribuye bajo una licencia de uso libre. Puedes utilizar, modificar y redistribuir el código sin restricciones, siempre y cuando incluyas los créditos originales y no ofrezcas garantía de ningún tipo. El autor no se hace responsable de usos indebidos o de posibles daños que surjan a partir de este software.

Créditos
Benitez, Alejo: Desarrollador web (Python, JavaScript, CSS).
