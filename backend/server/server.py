from flask_socketio import SocketIO
from flask_cors import CORS
import os
import datetime
import glob
import board
import busio
import adafruit_ahtx0
import RPi.GPIO as GPIO
import threading
import time
import paho.mqtt.client as mqtt


app = Flask(__name__)
socketio = SocketIO(app)
CORS(app)  # Permitir CORS para todas las rutas


# Ruta del directorio donde se guardarán los archivos
log_directory = '/home/Alejo/Desktop/casa domotica/backend/Registro'
os.makedirs(log_directory, exist_ok=True)


# Configuración de los pines GPIO para los relés
pins = {
    'relay1': 20,
    'relay2': 21,
    'light1': 12,
    'light2': 26,
    'light3': 19,
    'light4': 13,
    'tempRelay1': 6,
    'tempRelay2': 5
}


# Variables globales para almacenar el estado de corriente de las luces
estado_luz_comedor = 0
estado_luz_hab1 = 0


# Configurar los pines como salida
GPIO.setmode(GPIO.BCM)
for pin in pins.values():
    GPIO.setup(pin, GPIO.OUT)
    GPIO.output(pin, GPIO.LOW)  # Apagar todos los relés al inicio


# Inicializar el estado de los pines
states = {name: GPIO.input(pin) for name, pin in pins.items()}


# Inicializar el bus I2C y el sensor AHT10
i2c1 = busio.I2C(board.SCL, board.SDA)
sensor1 = adafruit_ahtx0.AHTx0(i2c1)


# Simulamos una base de datos de usuarios con contraseñas
users = {
    "Raspi_Domotic": "KingDom23"
}


# Función callback cuando se recibe un mensaje MQTT
def on_message(client, userdata, msg):
    global estado_luz_comedor, estado_luz_hab1
    message = msg.payload.decode()
    print(f"Mensaje recibido en {msg.topic}: {message}")


    if msg.topic == "home/relay/1":
        if message == "on":
            GPIO.output(pins['relay1'], GPIO.HIGH)
            print("Relé 1 encendido")
        elif message == "off":
            GPIO.output(pins['relay1'], GPIO.LOW)
            print("Relé 1 apagado")


    elif msg.topic == "home/relay/2":
        if message == "on":
            GPIO.output(pins['relay2'], GPIO.HIGH)
            print("Relé 2 encendido")
        elif message == "off":
            GPIO.output(pins['relay2'], GPIO.LOW)
            print("Relé 2 apagado")


    elif msg.topic == "home/luz/comedor":
        estado_luz_comedor = float(message)  # Almacenar el valor de corriente recibido para la luz de comedor


    elif msg.topic == "home/luz/hab1":
        estado_luz_hab1 = float(message)  # Almacenar el valor de corriente recibido para la luz de Hab1


    elif msg.topic == "home/servo/log":
        save_log(message)


# Función para guardar el log con rotación de archivos y depuración
def save_log(content):
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"{timestamp} - {content}"
    file_path = os.path.join(log_directory, 'servo_log.txt')


    with open(file_path, 'a') as file:
        file.write(log_entry + '\n')


    print(f"Log guardado en {file_path}: {log_entry}")


    # Verificar cuántas líneas hay en el archivo
    with open(file_path, 'r') as file:
        lines = file.readlines()


    if len(lines) >= 5:  # Si hay más de 5 líneas, mover el archivo
        num_old_files = len(glob.glob(os.path.join(log_directory, 'servo_log_antiguo_*')))


        # Si hay más de 10 archivos antiguos, eliminar los más viejos
        if num_old_files >= 10:
            for old_file in glob.glob(os.path.join(log_directory, 'servo_log_antiguo_*')):
                os.remove(old_file)
            num_old_files = 0  # Reiniciar el contador de archivos antiguos


        # Crear el archivo antiguo y renombrar el archivo principal
        new_filename = f"servo_log_antiguo_{num_old_files + 1}.txt"
        print(f"Moviendo log a archivo antiguo: {new_filename}")
        os.rename(file_path, os.path.join(log_directory, new_filename))


# Configuración del cliente MQTT utilizando la nueva API
client = mqtt.Client(client_id="", clean_session=True, protocol=mqtt.MQTTv311, transport="tcp")
client.on_message = on_message


# Conectar al broker MQTT usando mDNS
client.connect("raspberrypi.local", 1883, 60)


# Suscribirse a los temas para controlar relés y recibir logs
client.subscribe("home/relay/1")
client.subscribe("home/relay/2")
client.subscribe("home/luz/comedor")
client.subscribe("home/luz/hab1")
client.subscribe("home/servo/log")


# Ruta para autenticación de login
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')


    if not username or not password:
        return jsonify({"status": "error", "message": "Faltan credenciales"}), 400


    if username in users and users[username] == password:
        return jsonify({"status": "success", "message": "Inicio de sesión exitoso"}), 200
    else:
        return jsonify({"status": "error", "message": "Usuario o contraseña incorrectos"}), 401


# Ruta para alternar el estado de un relé
@app.route('/api/toggle/<string:relay>', methods=['POST'])
def toggle_relay(relay):
    if relay in pins:
        current_state = GPIO.input(pins[relay])
        new_state = GPIO.LOW if current_state == GPIO.HIGH else GPIO.HIGH
        GPIO.output(pins[relay], new_state)
        states[relay] = new_state


        if relay == 'tempRelay1':
            states['manual_tempRelay1'] = True
        elif relay == 'tempRelay2':
            states['manual_tempRelay2'] = True


        return jsonify({"success": True, "state": new_state}), 200
    return jsonify({"success": False, "error": "Invalid relay name"}), 400


# Ruta para obtener el estado de todos los pines, incluyendo el estado del ACS712
@app.route('/api/states', methods=['GET'])
def get_states():
    for relay, pin in pins.items():
        states[relay] = GPIO.input(pin)
    # Agregar los estados de corriente recibidos por MQTT
    states['luz_comedor'] = estado_luz_comedor  # Corriente luz comedor
    states['luz_hab1'] = estado_luz_hab1        # Corriente luz Hab1
    return jsonify(states)


# Ruta para obtener las temperaturas del AHT10
@app.route('/api/temperature', methods=['GET'])
def get_temperature():
    try:
        temp1 = sensor1.temperature
        return jsonify({"temperature1": temp1}), 200
    except Exception as e:
        return jsonify({"error": f"Error al obtener la temperatura: {str(e)}"}), 500


# Función para revisar la temperatura cada 2 horas y controlar los relés
def monitor_temperature():
    while True:
        try:
            temp = sensor1.temperature
            print(f"Temperatura actual: {temp}°C")
            if temp >= 25:
                if not states['tempRelay1']:
                    GPIO.output(pins['tempRelay1'], GPIO.HIGH)
                    states['tempRelay1'] = GPIO.HIGH
            elif temp <= 5:
                if not states['tempRelay2']:
                    GPIO.output(pins['tempRelay2'], GPIO.HIGH)
                    states['tempRelay2'] = GPIO.HIGH
        except Exception as e:
            print(f"Error en la lectura de temperatura: {str(e)}")
       
        time.sleep(2 * 60 * 60)  # Esperar 2 horas


# Iniciar el monitoreo de la temperatura en un hilo separado
threading.Thread(target=monitor_temperature, daemon=True).start()


@app.route('/api/total-files', methods=['GET'])
def get_total_files():
    log_files = glob.glob(os.path.join(log_directory, 'servo_log_antiguo_*.txt'))
    total_files = len(log_files) + 1  # Incluye el archivo actual
    return jsonify({"totalFiles": total_files}), 200


@app.route('/api/read-text', methods=['GET'])
def read_text_file():
    file_index = int(request.args.get('fileIndex', 0))
    log_files = sorted(glob.glob(os.path.join(log_directory, 'servo_log_antiguo_*.txt')))
    log_files.append(os.path.join(log_directory, 'servo_log.txt'))


    if 0 <= file_index < len(log_files):
        file_path = log_files[file_index]
        if os.path.exists(file_path):
            with open(file_path, 'r') as file:
                lines = file.readlines()
                return jsonify({"lines": [line.strip() for line in lines[-5:]]}), 200
        return jsonify({"lines": [], "message": "Archivo vacío."}), 200
    return jsonify({"error": "El archivo no existe"}), 404


if __name__ == '__main__':
    try:
        # Iniciar el bucle principal de MQTT en un hilo separado
        threading.Thread(target=client.loop_forever, daemon=True).start()


        # Iniciar el servidor Flask
        socketio.run(app, host='0.0.0.0', port=3002)
    except KeyboardInterrupt:
        GPIO.cleanup()
