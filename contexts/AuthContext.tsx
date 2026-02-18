import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserData {
  name: string;
  email: string;
  avatarUrl?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  currentUser: UserData | null;
  login: (email: string, password: string) => boolean;
  register: (userData: { name: string; email: string; password: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = '75hard_auth_user';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setCurrentUser(parsedUser);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  // Guardar usuario en localStorage cuando cambie
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [currentUser]);

  const login = (email: string, password: string): boolean => {
    // Validación específica para credenciales de prueba
    if (email === 'correo@correo.com' && password === '123') {
      const userData: UserData = {
        name: 'Usuario Demo',
        email: email,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
      };
      // Delay state update slightly to allow UI to show success message if needed, 
      // but here we just return true.
      setCurrentUser(userData);
      setIsLoggedIn(true);
      return true;
    } else {
      // Simulación de login para otras credenciales
      return false;
    }
  };

  const register = (userData: { name: string; email: string; password: string }) => {
    // Simulación de registro exitoso
    const newUser: UserData = {
      name: userData.name,
      email: userData.email,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + userData.name
    };
    setCurrentUser(newUser);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const value: AuthContextType = {
    isLoggedIn,
    currentUser,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
