import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const ControlDeLuz = () => {
  const [luz1State, setLuz1State] = useState(false);  // Luz Comedor (actualizada por MQTT)
  const [luz2State, setLuz2State] = useState(false);  // Luz Hab1
  const [luz3State, setLuz3State] = useState(false);  // Luz Hab2
  const [luz4State, setLuz4State] = useState(false);  // Luz Cocina
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const API_URL = `http://${window.location.hostname}:3002`;

  useEffect(() => {
    // Obtener los estados iniciales de los relés
    const interval = setInterval(() => {
      axios.get(`${API_URL}/api/states`)
        .then(response => {
          // Aquí, asegura que 'light1' corresponde a 'luz_comedor' y refleja su estado de "on"/"off"
          setLuz1State(response.data.luz_comedor === "on");  // Verifica que esto concuerde con los datos de MQTT
          setLuz2State(response.data.light2 === 1);
          setLuz3State(response.data.light3 === 1);
          setLuz4State(response.data.light4 === 1);
        })
        .catch(error => console.error('Error al obtener estados:', error));
    }, 900); // Intervalo de actualización

    return () => clearInterval(interval);
  }, [API_URL]);

  const toggleLuz1 = () => {
    setIsButtonDisabled(true);
    axios.post(`${API_URL}/api/toggle/light1`)
      .then(response => setLuz1State(response.data.state === 1))
      .catch(error => console.error('Error al alternar luz 1:', error))
      .finally(() => {
        setTimeout(() => {
          setIsButtonDisabled(false);
        }, 3000);
      });
  };

  const toggleLuz2 = () => {
    setIsButtonDisabled(true);
    axios.post(`${API_URL}/api/toggle/light2`)
      .then(response => setLuz2State(response.data.state === 1))
      .catch(error => console.error('Error al alternar luz 2:', error))
      .finally(() => {
        setTimeout(() => {
          setIsButtonDisabled(false);
        }, 3000);
      });
  };

  const toggleLuz3 = () => {
    setIsButtonDisabled(true);
    axios.post(`${API_URL}/api/toggle/light3`)
      .then(response => setLuz3State(response.data.state === 1))
      .catch(error => console.error('Error al alternar luz 3:', error))
      .finally(() => {
        setTimeout(() => {
          setIsButtonDisabled(false);
        }, 3000);
      });
  };

  const toggleLuz4 = () => {
    setIsButtonDisabled(true);
    axios.post(`${API_URL}/api/toggle/light4`)
      .then(response => setLuz4State(response.data.state === 1))
      .catch(error => console.error('Error al alternar luz 4:', error))
      .finally(() => {
        setTimeout(() => {
          setIsButtonDisabled(false);
        }, 3000);
      });
  };

  return (
    <div className="container">
      <h3>Control de Luces</h3>
      <div className="button-container">
        <button className="button" onClick={toggleLuz1} disabled={isButtonDisabled}>
          Luz Comedor: {luz1State ? 'Encendida' : 'Apagada'}
        </button>
        <button className="button" onClick={toggleLuz2} disabled={isButtonDisabled}>
          Luz Hab1: {luz2State ? 'Encendida' : 'Apagada'}
        </button>
        <button className="button" onClick={toggleLuz3} disabled={isButtonDisabled}>
          Luz Hab2: {luz3State ? 'Encendida' : 'Apagada'}
        </button>
        <button className="button" onClick={toggleLuz4} disabled={isButtonDisabled}>
          Luz Cocina: {luz4State ? 'Encendida' : 'Apagada'}
        </button>
        <button className="back-button" onClick={() => window.location.href = '/'}>
          Volver a la Página Principal
        </button>
      </div>
    </div>
  );
};

export default ControlDeLuz;