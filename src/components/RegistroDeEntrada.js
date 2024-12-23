import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = `http://${window.location.hostname}:3002`;

const RegistroDeEntrada = () => {
  const [logEntries, setLogEntries] = useState([]);
  const [tarjetas, setTarjetas] = useState([]);
  const [nuevaTarjeta, setNuevaTarjeta] = useState('');
  const [nuevoServo, setNuevoServo] = useState(1); // Nuevo estado para seleccionar servomotor
  const [mensaje, setMensaje] = useState('');
  const [currentView, setCurrentView] = useState('logs');
  const [logs, setLogs] = useState([]); // Nueva variable de estado para los registros
  const [error, setError] = useState(''); // Nueva variable de estado para errores

  // Obtener registros desde la base de datos
  const obtenerRegistros = () => {
    axios
      .get(`${API_URL}/api/logs`)
      .then((response) => {
        setLogs(response.data); // Establecer los registros obtenidos
      })
      .catch((error) => {
        const errorMsg = error.response?.data?.error || 'Error al obtener los registros';
        setError(errorMsg); // Manejar el error
        console.error('Error al obtener los registros:', error);
      });
  };

  useEffect(() => {
    if (currentView === 'logs') {
      obtenerRegistros();
    } else if (currentView === 'tarjetas') {
      fetchTarjetas();
    }
  }, [currentView]);

  const fetchTarjetas = () => {
    axios
      .get(`${API_URL}/api/tarjetas`)
      .then((response) => setTarjetas(response.data))
      .catch((error) => console.error('Error al obtener las tarjetas:', error));
  };

  const registrarTarjeta = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/tarjetas`, {
        tarjeta: nuevaTarjeta,
        servo: nuevoServo, // Incluye el servomotor en la solicitud
      });

      if (response.status === 201) {
        setMensaje('Tarjeta registrada exitosamente');
        fetchTarjetas(); // Actualiza la lista de tarjetas
      } else {
        setMensaje('Error al registrar la tarjeta');
      }
    } catch (error) {
      console.error('Error:', error);
      setMensaje('Error al registrar la tarjeta');
    }
  };

  const eliminarTarjeta = (id) => {
    axios
      .delete(`${API_URL}/api/tarjetas/${id}`)
      .then((response) => {
        setMensaje(response.data.message);
        setTarjetas(tarjetas.filter((tarjeta) => tarjeta.id !== id));
      })
      .catch((error) => {
        const errorMsg = error.response?.data?.error || 'Error al eliminar la tarjeta';
        setMensaje(errorMsg);
        console.error('Error al eliminar la tarjeta:', error);
      });
  };

  const renderLogs = () => (
    <div className="log-container">
      <h4>Registros de Movimientos</h4>
      <ul className="log-lines">
        {logs.length > 0 ? (
          logs.map((entry, index) => (
            <li key={index}>
              {entry.horario} - Tarjeta: {entry.tarjeta} - Servo: {entry.servo}
            </li>
          ))
        ) : (
          <p>No hay registros disponibles.</p>
        )}
      </ul>
    </div>
  );

  const renderTarjetas = () => (
    <div className="tarjetas-container">
      <h4>Tarjetas Registradas</h4>
      <ul>
        {tarjetas.map((tarjeta, index) => (
          <li key={index}>
            {tarjeta.tarjeta} - Servo: {tarjeta.servo} {/* Mostrar servomotor asignado */}
            <button onClick={() => eliminarTarjeta(tarjeta.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
      <h4>Registrar Nueva Tarjeta</h4>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          registrarTarjeta();
        }}
      >
        <input
          type="text"
          placeholder="ID de tarjeta"
          value={nuevaTarjeta}
          onChange={(e) => setNuevaTarjeta(e.target.value)}
          required
        />
        <select value={nuevoServo} onChange={(e) => setNuevoServo(parseInt(e.target.value))}>
          <option value={1}>Servo 1</option>
          <option value={2}>Servo 2</option>
        </select>
        <button type="submit">Registrar</button>
      </form>
    </div>
  );

  return (
    <div className="container">
      <h3>Registro de Entrada</h3>
      <div className="button-container">
        <button onClick={() => setCurrentView('logs')}>Ver Movimientos</button>
        <button onClick={() => setCurrentView('tarjetas')}>Ver Tarjetas</button>
        <button
          className="back-button"
          onClick={() => (window.location.href = '/')}
        >
          Volver a la Página Principal
        </button>
      </div>
      {currentView === 'logs' && renderLogs()}
      {currentView === 'tarjetas' && renderTarjetas()}
      {mensaje && <p>{mensaje}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default RegistroDeEntrada;