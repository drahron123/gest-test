
import React, { useState } from 'react';
import { Role, User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent, role: Role) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulazione di una chiamata API
    setTimeout(() => {
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: role === Role.ADMIN ? 'Admin User' : 'Standard User',
        email: email || (role === Role.ADMIN ? 'admin@nexushub.it' : 'user@nexushub.it'),
        role: role,
        avatar: `https://picsum.photos/seed/${role}/100/100`
      };
      onLogin(mockUser);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-blue-500 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-10">
          <div className="inline-block p-3 rounded-xl bg-indigo-50 mb-4">
            <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">NexusHub</h1>
          <p className="text-gray-500 mt-2">Accedi al tuo gestionale aziendale</p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="nome@azienda.it"
            />
          </div>
          
          <div className="pt-4 grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, Role.ADMIN)}
              disabled={isLoading}
              className="flex items-center justify-center py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all disabled:opacity-50"
            >
              Accedi come Admin
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, Role.USER)}
              disabled={isLoading}
              className="flex items-center justify-center py-2.5 px-4 bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              Accedi come User
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            NexusHub v1.0 • Gestione aziendale intelligente
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
