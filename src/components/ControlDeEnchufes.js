import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const ControlDeEnchufes = () => {
  const [enchufe1State, setEnchufe1State] = useState(false);
  const [enchufe2State, setEnchufe2State] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const API_URL = `http://${window.location.hostname}:3002`;

  useEffect(() => {
    const interval = setInterval(() => {
      axios.get(`${API_URL}/api/states`)
        .then(response => {
          setEnchufe1State(response.data.relay1 === 1);
          setEnchufe2State(response.data.relay2 === 1);
        })
        .catch(error => console.error('Error al obtener estados:', error));
    }, 1500);

    return () => clearInterval(interval);
  }, [API_URL]);

  const toggleEnchufe1 = () => {
    setIsButtonDisabled(true);
    axios.post(`${API_URL}/api/toggle/relay1`)
      .then(response => setEnchufe1State(response.data.state === 1))
      .catch(error => console.error('Error al alternar enchufe 1:', error))
      .finally(() => {
        setTimeout(() => {
          setIsButtonDisabled(false);
        }, 3000);
      });
  };

  const toggleEnchufe2 = () => {
    setIsButtonDisabled(true);
    axios.post(`${API_URL}/api/toggle/relay2`)
      .then(response => setEnchufe2State(response.data.state === 1))
      .catch(error => console.error('Error al alternar enchufe 2:', error))
      .finally(() => {
        setTimeout(() => {
          setIsButtonDisabled(false);
        }, 3000);
      });
  };

  return (
    <div className="container">
      <h3>Control de Enchufes</h3>
      <button onClick={toggleEnchufe1} disabled={isButtonDisabled}>
        Enchufe Hab1: {enchufe1State ? 'Encendido' : 'Apagado'}
      </button>
      <button onClick={toggleEnchufe2} disabled={isButtonDisabled}>
        Enchufe Hab2: {enchufe2State ? 'Encendido' : 'Apagado'}
      </button>
      <button className="back-button" onClick={() => window.location.href = '/'}>
        Volver a la Página Principal
      </button>
    </div>
  );
};

export default ControlDeEnchufes;
