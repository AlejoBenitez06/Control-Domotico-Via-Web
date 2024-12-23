#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ESP8266mDNS.h>
#include <SPI.h>
#include <MFRC522.h>
#include <Servo.h>

// Pines del lector RFID
#define SS_PIN 4  
#define RST_PIN 5  

// Pines para los servomotores
const int servo1Pin = 1;
const int servo2Pin = 3;

// Pines del sensor ultrasónico
const int trigPin = 10;
const int echoPin = 9;  

// Pines de los relés
const int relay1Pin = 0;
const int relay2Pin = 2;

// Configuración de WiFi y MQTT
const char* ssid = "Homeland";
const char* password = "Enterprise.Transporteme*";
const char* mqtt_server = "raspberrypi.local";  // Usamos mDNS para encontrar la Raspberry Pi

WiFiClient espClient;
PubSubClient client(espClient);
MFRC522 rfid(SS_PIN, RST_PIN);  // Instancia de RFID
Servo servo1, servo2;           // Instancias de servos

// Variables de estado
bool servo2Movido = false;
String tarjetaDetectada = "";

void setup() {
  Serial.begin(115200);
  SPI.begin();
  rfid.PCD_Init();

  // Inicializar servos
  servo1.attach(servo1Pin);
  servo2.attach(servo2Pin);

  // Configuración de pines del sensor ultrasónico
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  // Configuración de pines de relés
  pinMode(relay1Pin, OUTPUT);
  pinMode(relay2Pin, OUTPUT);
  digitalWrite(relay1Pin, LOW);
  digitalWrite(relay2Pin, LOW);

  // Conectar a la red WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Conectando a WiFi...");
  }
  Serial.println("Conectado a WiFi");

  // Configurar mDNS para resolver raspberrypi.local
  if (!MDNS.begin("esp8266")) {
    Serial.println("Error al configurar mDNS");
    return;
  }
  Serial.println("mDNS iniciado para esp8266.local");

  // Configurar MQTT
  client.setServer(mqtt_server, 1883);
  client.setCallback(callbackMQTT);

  // Intentar conectar al broker MQTT
  while (!client.connected()) {
    Serial.print("Conectando al broker MQTT...");
    if (client.connect("ESP8266Client")) {
      Serial.println("Conectado al broker MQTT");
      // Suscribirse a los temas para controlar los relés
      client.subscribe("home/relay/1");
      client.subscribe("home/relay/2");
    } else {
      Serial.print("Fallo al conectar. Código de error: ");
      Serial.print(client.state());
      delay(5000);
    }
  }
}

void loop() {
  client.loop();  // Mantener la conexión MQTT

  // Verificar la tarjeta RFID
  if (leerTarjetaRFID()) {
    // Ejemplo de IDs de tarjetas conocidas
    if (tarjetaDetectada == "b310efe" || tarjetaDetectada == "4c84c12f") {
      moverServo1();
    } else if (tarjetaDetectada == "13e94210") {
      moverServo2();
      servo2Movido = true;
    }
    enviarRegistro("");  // Enviar el registro cuando se detecta una tarjeta
  }

  // Verificar la distancia con el sensor ultrasónico si el servo2 está a 90°
  if (servo2Movido) {
    if (verificarUltrasonido()) {
      servo2.write(0);  // Regresar el servo2 a 0°
      servo2Movido = false;
      enviarRegistro("Servo2 movido a 0° por detección de ultrasonido");
    }
  }

  delay(2000);  // Ajusta el retardo a tu gusto
}

// Función para leer la tarjeta RFID
bool leerTarjetaRFID() {
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
    return false;
  }
  tarjetaDetectada = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    tarjetaDetectada += String(rfid.uid.uidByte[i], HEX);
  }
  tarjetaDetectada.toLowerCase();
  rfid.PICC_HaltA();
  return true;
}

// Función para mover el servo1
void moverServo1() {
  servo1.write(90);  // Girar a 90°
  delay(5000);       // Esperar 5 segundos
  servo1.write(0);   // Regresar a 0°
}

// Función para mover el servo2
void moverServo2() {
  servo2.write(90);  // Girar a 90°
}

// Función para verificar la distancia con el sensor ultrasónico
bool verificarUltrasonido() {
  long duration;
  int distance;

  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  duration = pulseIn(echoPin, HIGH);
  distance = duration * 0.034 / 2;

  return distance <= 10;
}

// Función para enviar el registro al Raspberry Pi vía MQTT
void enviarRegistro(String mensajeAdicional) {
  if (WiFi.status() == WL_CONNECTED) {
    String logContent = "Movimiento de servo: ";
    // Para saber cuál servo se movió
    logContent += (tarjetaDetectada == "13e94210") ? "Servo2" : "Servo1";
    logContent += " con la tarjeta " + String(tarjetaDetectada.c_str()) + ". " + mensajeAdicional;
    client.publish("home/servo/log", logContent.c_str());
    Serial.println("Registro enviado vía MQTT: " + logContent);
  } else {
    Serial.println("No conectado a WiFi, no se pudo enviar el registro.");
  }
}

// Función callback para manejar los mensajes recibidos via MQTT
void callbackMQTT(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.print("Mensaje recibido [");
  Serial.print(topic);
  Serial.print("]: ");
  Serial.println(message);

  if (String(topic) == "home/relay/1") {
    if (message == "on") {
      digitalWrite(relay1Pin, HIGH);
      Serial.println("Relé 1 encendido.");
    } else if (message == "off") {
      digitalWrite(relay1Pin, LOW);
      Serial.println("Relé 1 apagado.");
    }
  } else if (String(topic) == "home/relay/2") {
    if (message == "on") {
      digitalWrite(relay2Pin, HIGH);
      Serial.println("Relé 2 encendido.");
    } else if (message == "off") {
      digitalWrite(relay2Pin, LOW);
      Serial.println("Relé 2 apagado.");
    }
  }
}
