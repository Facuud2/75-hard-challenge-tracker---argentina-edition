import React, { useState } from 'react';
import { User, Lock, Mail, Eye, EyeOff, UserPlus } from 'lucide-react';

interface RegisterProps {
  theme?: 'dark' | 'light';
  onRegister: (userData: { name: string; email: string; password: string }) => void;
  onSwitchToLogin: () => void;
}

export default function Register({ theme = 'dark', onRegister, onSwitchToLogin }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!email.trim()) {
      newErrors.email = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'El correo no es válido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({}); // Limpiar errores previos

    try {
      // Verificamos si el correo ya existe antes de continuar al Onboarding
      const response = await fetch('http://localhost:3001/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Error al verificar el correo');
      }

      const data = await response.json();

      if (data.exists) {
        setErrors({ email: 'Este correo electrónico ya está registrado' });
        setIsLoading(false);
        return;
      }

      // Si el correo está libre, avanzamos al siguiente paso del Onboarding
      onRegister({ name, email, password });
    } catch (err) {
      console.error('Error verificando email:', err);
      setErrors({ email: 'Error de conexión con el servidor. Intenta nuevamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-lg border transition-colors duration-300 ${theme === 'dark'
      ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-pink-500 focus:outline-none'
    }`;

  const buttonClass = `w-full py-3 rounded-lg font-medium transition-all duration-300 ${theme === 'dark'
      ? 'bg-pink-600 hover:bg-pink-700 text-white'
      : 'bg-pink-500 hover:bg-pink-600 text-white'
    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`;

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-8">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-pink-600/20' : 'bg-pink-100'
          }`}>
          <UserPlus className={`w-8 h-8 ${theme === 'dark' ? 'text-pink-400' : 'text-pink-600'}`} />
        </div>
        <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
          Crea tu cuenta
        </h2>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
          Únete al desafío 75 Hard y transforma tu vida
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
            Nombre completo
          </label>
          <div className="relative">
            <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Juan Pérez"
              className={`${inputClass} pl-12 ${errors.name ? 'border-red-500' : ''}`}
              required
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
            Correo electrónico
          </label>
          <div className="relative">
            <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className={`${inputClass} pl-12 ${errors.email ? 'border-red-500' : ''}`}
              required
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
            Contraseña
          </label>
          <div className="relative">
            <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`${inputClass} pl-12 pr-12 ${errors.password ? 'border-red-500' : ''}`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                } transition-colors`}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password}</p>
          )}
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
            Confirmar contraseña
          </label>
          <div className="relative">
            <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className={`${inputClass} pl-12 pr-12 ${errors.confirmPassword ? 'border-red-500' : ''}`}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                } transition-colors`}
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
          )}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="terms"
            className={`w-4 h-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}
            required
          />
          <label htmlFor="terms" className={`ml-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
            Acepto los{' '}
            <a href="#" className={`${theme === 'dark' ? 'text-pink-400 hover:text-pink-300' : 'text-pink-600 hover:text-pink-500'
              } transition-colors`}>
              términos y condiciones
            </a>
            {' '}y la{' '}
            <a href="#" className={`${theme === 'dark' ? 'text-pink-400 hover:text-pink-300' : 'text-pink-600 hover:text-pink-500'
              } transition-colors`}>
              política de privacidad
            </a>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={buttonClass}
        >
          {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>

      <div className={`mt-6 text-center pt-6`}>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
          ¿Ya tienes una cuenta?{' '}
          <button
            onClick={onSwitchToLogin}
            className={`font-medium ${theme === 'dark' ? 'text-pink-400 hover:text-pink-300' : 'text-pink-600 hover:text-pink-500'
              } transition-colors`}
          >
            Inicia sesión
          </button>
        </p>
      </div>
    </div>
  );
}