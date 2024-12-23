import React from 'react';
import { useHistory } from 'react-router-dom';
import './App.css';

const MainPage = ({ onLogout }) => { // Recibir la función de logout como prop
  const history = useHistory();

  const handleOptionClick = (path) => {
    history.push(path);
  };

  const openExternalLink = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleLogout = () => {
    onLogout(); // Llama a la función de logout pasada como prop
    history.push('/login'); // Redirigir a la página de login después de cerrar sesión
  };

  return (
    <div className="container">
      <h3>Pagina Principal</h3>
      <div className="button-container">
        <button onClick={() => handleOptionClick('/ControlDeLuz')}>Control Luz</button>
        <button onClick={() => handleOptionClick('/ControlDeTemperatura')}>Control de Temperatura</button>
        <button onClick={() => handleOptionClick('/ControlDeEnchufes')}>Control de Enchufes</button>
        <button onClick={() => handleOptionClick('/ControlDePatio')}>Control de Patio</button>
        <button onClick={() => handleOptionClick('/RegistroDeEntrada')}>Registro de Entrada</button>
        <button onClick={handleLogout}>Cerrar Sesión</button> {/* Botón para cerrar sesión */}
        <button className="ayuda" onClick={() => openExternalLink('https://sites.google.com/view/monark-house/preguntas-frecuentes?authuser=0')}>Ayuda</button>
      </div>
    </div>
  );
};

export default MainPage;