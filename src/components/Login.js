import React, { useState } from 'react'; 
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import './App.css';

const Login = ({ setAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();

  // Definir la URL de la API
  const API_URL = `http://${window.location.hostname}:3002`;  // URL dinámica para backend

  // Definir la función handleLogin
  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Enviar credenciales al backend
      const response = await axios.post(`${API_URL}/api/login`, {
        username,
        password,
      });

      // Verificar si el login fue exitoso
      if (response.status === 200 && response.data.status === 'success') {
        setAuthenticated(true);  // Cambiar el estado global de autenticación
        history.push('/');  // Redirigir a la página principal
      } else {
        setError('Usuario o contraseña incorrectos');
      }
    } catch (error) {
      setError('Error al iniciar sesión');
      console.error('Error de inicio de sesión:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h3>Iniciar sesión</h3>
      <form onSubmit={handleLogin}>  {/* Asociar handleLogin al evento onSubmit */}
        <div>
          <label>Usuario</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;
