import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const ControlDeTemperatura = () => {
  const [temperature1, setTemperature1] = useState(null);
  const [tempRelay1State, setTempRelay1State] = useState(false);
  const [tempRelay2State, setTempRelay2State] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // URL de la API
  const API_URL = `http://${window.location.hostname}:3002`;

  useEffect(() => {
    // Intervalo para actualizar el estado de los relés y la temperatura cada 1,5 segundos
    const interval = setInterval(() => {
      axios.get(`${API_URL}/api/temperature`)
        .then(response => {
          setTemperature1(response.data.temperature1);
        })
        .catch(error => console.error('Error al obtener la temperatura:', error));

      axios.get(`${API_URL}/api/states`)
        .then(response => {
          setTempRelay1State(response.data.tempRelay1 === 1);
          setTempRelay2State(response.data.tempRelay2 === 1);
        })
        .catch(error => console.error('Error al obtener los estados de los relés:', error));
    }, 1500);

    return () => clearInterval(interval);
  }, [API_URL]);

  const toggleTempRelay1 = () => {
    setIsButtonDisabled(true);
    axios.post(`${API_URL}/api/toggle/tempRelay1`)
      .then(response => setTempRelay1State(response.data.state === 1))
      .catch(error => console.error('Error al alternar el relé 1:', error))
      .finally(() => {
        setTimeout(() => {
          setIsButtonDisabled(false);
        }, 3000);
      });
  };

  const toggleTempRelay2 = () => {
    setIsButtonDisabled(true);
    axios.post(`${API_URL}/api/toggle/tempRelay2`)
      .then(response => setTempRelay2State(response.data.state === 1))
      .catch(error => console.error('Error al alternar el relé 2:', error))
      .finally(() => {
        setTimeout(() => {
          setIsButtonDisabled(false);
        }, 3000);
      });
  };

  return (
    <div className="container">
      <h3>Control de Temperatura</h3>

      <div className="temp-controls">
        <button onClick={toggleTempRelay1} disabled={isButtonDisabled}>
          Control de Temperatura Hab1: {tempRelay1State ? 'Encendido' : 'Apagado'}
        </button>
        <label>Temperatura en Hab1: {temperature1 !== null ? `${temperature1.toFixed(2)}°C` : 'Cargando...'}</label>

        <button onClick={toggleTempRelay2} disabled={isButtonDisabled}>
          Control de Temperatura Hab2: {tempRelay2State ? 'Encendido' : 'Apagado'}
        </button>
      </div>

      <button className="back-button" onClick={() => window.location.href = '/'}>
        Volver a la Página Principal
      </button>
    </div>
  );
};

export default ControlDeTemperatura;