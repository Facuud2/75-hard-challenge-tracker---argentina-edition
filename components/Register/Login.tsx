import React, { useState } from 'react';
import { User, Lock, Mail, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  theme?: 'dark' | 'light';
  onLogin: (email: string, password: string) => void;
  onSwitchToRegister: () => void;
}

export default function Login({ theme = 'dark', onLogin, onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulación de login - en producción esto iría a una API
    setTimeout(() => {
      onLogin(email, password);
      setIsLoading(false);
    }, 1000);
  };

  const inputClass = `w-full px-4 py-3 rounded-lg border transition-colors duration-300 ${
    theme === 'dark'
      ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-pink-500 focus:outline-none'
  }`;

  const buttonClass = `w-full py-3 rounded-lg font-medium transition-all duration-300 ${
    theme === 'dark'
      ? 'bg-pink-600 hover:bg-pink-700 text-white'
      : 'bg-pink-500 hover:bg-pink-600 text-white'
  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`;

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-8">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
          theme === 'dark' ? 'bg-pink-600/20' : 'bg-pink-100'
        }`}>
          <User className={`w-8 h-8 ${theme === 'dark' ? 'text-pink-400' : 'text-pink-600'}`} />
        </div>
        <h2 className={`text-2xl font-bold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Bienvenido de nuevo
        </h2>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Inicia sesión para continuar con tu progreso
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Correo electrónico
          </label>
          <div className="relative">
            <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className={`${inputClass} pl-12`}
              required
            />
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Contraseña
          </label>
          <div className="relative">
            <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`${inputClass} pl-12 pr-12`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
              } transition-colors`}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className={`w-4 h-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500 ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}
            />
            <span className={`ml-2 text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Recordarme
            </span>
          </label>
          <a href="#" className={`text-sm ${
            theme === 'dark' ? 'text-pink-400 hover:text-pink-300' : 'text-pink-600 hover:text-pink-500'
          } transition-colors`}>
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={buttonClass}
        >
          {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </button>
      </form>

      <div className={`mt-6 text-center pt-6`}>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          ¿No tienes una cuenta?{' '}
          <button
            onClick={onSwitchToRegister}
            className={`font-medium ${
              theme === 'dark' ? 'text-pink-400 hover:text-pink-300' : 'text-pink-600 hover:text-pink-500'
            } transition-colors`}
          >
            Regístrate gratis
          </button>
        </p>
      </div>
    </div>
  );
}
