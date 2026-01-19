
import React, { useState, useEffect } from 'react';
import { Role, User, AuthState } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });

  // Simulazione caricamento sessione
  useEffect(() => {
    const savedUser = localStorage.getItem('nexus_user');
    if (savedUser) {
      setAuth({
        user: JSON.parse(savedUser),
        isAuthenticated: true,
      });
    }
  }, []);

  const handleLogin = (user: User) => {
    localStorage.setItem('nexus_user', JSON.stringify(user));
    setAuth({
      user,
      isAuthenticated: true,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('nexus_user');
    setAuth({
      user: null,
      isAuthenticated: false,
    });
  };

  if (!auth.isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Dashboard 
      user={auth.user!} 
      onLogout={handleLogout} 
    />
  );
};

export default App;
