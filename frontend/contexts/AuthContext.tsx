import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserData {
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  height?: number;
  weight?: number;
  onboardingCompleted?: boolean;
}

interface AuthContextType {
  isLoggedIn: boolean;
  currentUser: UserData | null;
  pendingRegistrationData: any | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: { name: string; email: string; password: string }) => void;
  finalizeRegistration: (onboardingData: { height: number; weight: number }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<UserData>) => void;
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
  const [pendingRegistrationData, setPendingRegistrationData] = useState<any | null>(null);

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

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        return false;
      }

      const { user } = await response.json();

      const establishedUser: UserData = {
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
        onboardingCompleted: user.onboardingCompleted
      };

      setCurrentUser(establishedUser);
      setIsLoggedIn(true);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = (userData: { name: string; email: string; password: string }) => {
    // Guarda los datos temporalmente
    setPendingRegistrationData(userData);

    // Genera un estado "virtual" de login que fuerza el Onboarding Flow
    const tempUser: UserData = {
      name: userData.name,
      email: userData.email,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + userData.name,
      onboardingCompleted: false
    };

    setCurrentUser(tempUser);
    setIsLoggedIn(true);
  };

  const finalizeRegistration = async (onboardingData: { height: number; weight: number }) => {
    if (!pendingRegistrationData) {
      // Corrupt state, likely due to a page reload losing the temporary data
      logout();
      throw new Error('Se perdieron los datos temporales del registro. Por favor, vuelve a intentar.');
    }

    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: pendingRegistrationData.name,
          email: pendingRegistrationData.email,
          password: pendingRegistrationData.password,
          weight: onboardingData.weight,
          height: onboardingData.height
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to register');
      }

      const { user } = await response.json();

      const establishedUser: UserData = {
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
        height: onboardingData.height,
        weight: onboardingData.weight,
        onboardingCompleted: true
      };

      setCurrentUser(establishedUser);
      setPendingRegistrationData(null); // Clear temporary data
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(establishedUser));

    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setPendingRegistrationData(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const updateProfile = (data: Partial<UserData>) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, ...data });
    }
  };

  const value: AuthContextType = {
    isLoggedIn,
    currentUser,
    pendingRegistrationData,
    login,
    register,
    finalizeRegistration,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
