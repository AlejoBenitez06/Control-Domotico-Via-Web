import React, { useState, useEffect } from 'react';
import mqtt from 'mqtt';
import './App.css';

const ControlDePatio = () => {
  const [client, setClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const MQTT_BROKER_URL = `ws://${window.location.hostname}:3001`;
    const mqttClient = mqtt.connect(MQTT_BROKER_URL);

    // Manejar la conexión
    mqttClient.on('connect', () => {
      console.log('Conectado al broker MQTT');
      setIsConnected(true);
    });

    // Manejar errores
    mqttClient.on('error', (err) => {
      console.error('Error de conexión MQTT:', err);
      setIsConnected(false);
    });

    setClient(mqttClient);

    // Limpiar la conexión y los eventos al desmontar el componente
    return () => {
      if (mqttClient) {
        mqttClient.end();
        mqttClient.off('connect');
        mqttClient.off('error');
      }
    };
  }, []);

  const handleRelay1On = () => {
    if (client && isConnected) {
      client.publish('esp/relay/1', 'on');
      console.log('Relé 1 encendido');
    } else {
      console.error('No se pudo enviar el mensaje. Cliente no conectado.');
    }
  };

  const handleRelay1Off = () => {
    if (client && isConnected) {
      client.publish('esp/relay/1', 'off');
      console.log('Relé 1 apagado');
    } else {
      console.error('No se pudo enviar el mensaje. Cliente no conectado.');
    }
  };

  const handleRelay2On = () => {
    if (client && isConnected) {
      client.publish('esp/relay/2', 'on');
      console.log('Relé 2 encendido');
    } else {
      console.error('No se pudo enviar el mensaje. Cliente no conectado.');
    }
  };

  const handleRelay2Off = () => {
    if (client && isConnected) {
      client.publish('esp/relay/2', 'off');
      console.log('Relé 2 apagado');
    } else {
      console.error('No se pudo enviar el mensaje. Cliente no conectado.');
    }
  };

  return (
    <div className="container">
      <h3>Control de Patio</h3>
      <div className="button-container">
        <button onClick={handleRelay1On} disabled={!isConnected}>Encender Relé 1</button>
        <button onClick={handleRelay1Off} disabled={!isConnected}>Apagar Relé 1</button>
        <button onClick={handleRelay2On} disabled={!isConnected}>Encender Relé 2</button>
        <button onClick={handleRelay2Off} disabled={!isConnected}>Apagar Relé 2</button>
      </div>
      {!isConnected && <p className="error">No conectado al broker MQTT</p>}
      <button className="back-button" onClick={() => window.location.href = '/'}>
        Volver a la Página Principal
      </button>
    </div>
  );
};

export default ControlDePatio;
