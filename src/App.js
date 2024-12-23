import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import MainPage from './components/MainPage';
import ControlDeLuces from './components/ControlDeLuz';
import RegistroDeEntrada from './components/RegistroDeEntrada';
import ControlDeTemperatura from './components/ControlDeTemperatura';
import ControlDePatio from './components/ControlDePatio';
import ControlDeEnchufes from './components/ControlDeEnchufes';
import Login from './components/Login';

// Definir una ruta privada que solo es accesible si el usuario está autenticado
const PrivateRoute = ({ component: Component, authenticated, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      authenticated ? (
        <Component {...props} />
      ) : (
        <Redirect to="/login" />  // Si no está autenticado, redirige al login
      )
    }
  />
);

function App() {
  // Estado para manejar si el usuario está autenticado
  const [authenticated, setAuthenticated] = useState(false);

  // Al cargar la aplicación, revisar si el usuario ya está autenticado
  useEffect(() => {
    const savedAuthStatus = localStorage.getItem('authenticated');
    setAuthenticated(savedAuthStatus === 'true'); // Cambiado aquí
  }, []);

  // Función para manejar la autenticación y guardar el estado en localStorage
  const handleLogin = (status) => {
    setAuthenticated(status);
    localStorage.setItem('authenticated', status); // Guardar el estado en localStorage
  };

  const handleLogout = () => {
    setAuthenticated(false);
    localStorage.setItem('authenticated', 'false'); // Actualizar el estado al cerrar sesión
  };

  return (
    <Router>
      <Switch>
        {/* Rutas protegidas */}
        <PrivateRoute
          path="/"
          exact
          component={() => <MainPage onLogout={handleLogout} />} // Pasar la función de logout
          authenticated={authenticated}
        />
        <PrivateRoute
          path="/ControlDeLuz"
          component={ControlDeLuces}
          authenticated={authenticated}
        />
        <PrivateRoute
          path="/RegistroDeEntrada"
          component={RegistroDeEntrada}
          authenticated={authenticated}
        />
        <PrivateRoute
          path="/ControlDeTemperatura"
          component={ControlDeTemperatura}
          authenticated={authenticated}
        />
        <PrivateRoute
          path="/ControlDePatio"
          component={ControlDePatio}
          authenticated={authenticated}
        />
        <PrivateRoute
          path="/ControlDeEnchufes"
          component={ControlDeEnchufes}
          authenticated={authenticated}
        />

        {/* Ruta para el login (no protegida) */}
        <Route
          path="/login"
          component={() => <Login setAuthenticated={handleLogin} />}
        />
      </Switch>
    </Router>
  );
}

export default App;
