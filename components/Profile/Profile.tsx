import React, { useContext, useState } from 'react';
import { Trophy, Flame, Award, Gamepad2, MapPin, Star, X, User, LogOut } from 'lucide-react';
import Login from '../Register/Login';
import Register from '../Register/Register';
import { useAuth } from '../../contexts/AuthContext';

interface ProfileProps {
  theme?: 'dark' | 'light';
  isModal?: boolean;
  onClose?: () => void;
}

interface UserData {
  name: string;
  email: string;
  avatarUrl?: string;
}

// ==========================================
// 1. DEFINICIÓN DE TIPOS (CONTRATO DE DATOS)
// ==========================================
// Definimos las estructuras de datos. Esto ayuda a que el IDE te avise si cometes errores.

interface BadgePopupData {
  title: string;
  value: string | number;
  description: string;
  icon?: React.ReactNode;
}

interface Achievement {
  id: string;
  icon: React.ReactNode;
  name: string;
  unlocked: boolean;
  popupData: BadgePopupData;
}

interface ActivityLog {
  id: string;
  title: string;
  description: string;
  hoursSpent: number;
  lastActive: string; // ISO date string or human readable
  progress: number; // 0 to 100
  imageUrl: string; // Placeholder for the game/activity banner
  achievementsUnlocked: number;
  totalAchievements: number;
}

interface UserStats {
  currentDay: number;
  bestWeight: number; // kg
  longestStreak: number; // days
  level: number;
  xp: number;
  nextLevelXp: number;
}

interface UserProfile {
  username: string;
  handle: string;
  location: string;
  avatarUrl: string;
  status: 'online' | 'offline' | 'training';
  bio: string;
  badges: Achievement[];
  stats: UserStats;
  activities: ActivityLog[];
}

// ==========================================
// 2. MOCK DATA (DATOS DE PRUEBA)
// ==========================================
// Simulamos la respuesta de una API. En el futuro, esto vendrá de tu Backend.

const USER_DATA: UserProfile = {
  username: "Toxicボンク",
  handle: "#7DSI",
  location: "Argentina",
  avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix", // Avatar aleatorio
  status: 'online',
  bio: "Transformando disciplina en código. 75 Hard Challenge en proceso.",
  badges: [
    {
      id: '1',
      icon: <Trophy size={16} />,
      name: 'Gold Medal',
      unlocked: true,
      popupData: {
        title: "Trofeo Más Valioso",
        value: "Platino 2025",
        description: "Otorgado por completar todos los desafíos del año con calificación perfecta."
      }
    },
    {
      id: '2',
      icon: <Award size={16} />,
      name: '100+ Days',
      unlocked: true,
      popupData: {
        title: "Challenge Más Featured",
        value: "Reto de Verano",
        description: "Tu desafío más popular, destacado en la portada durante 3 semanas consecutivas."
      }
    },
    {
      id: '3',
      icon: <Star size={16} />,
      name: 'Elite',
      unlocked: true,
      popupData: {
        title: "Total de Me Gustas",
        value: "1,245",
        description: "Acumulados en todos tus comentarios y publicaciones hasta la fecha."
      }
    },
    {
      id: '4',
      icon: <Flame size={16} />,
      name: 'On Fire',
      unlocked: true,
      popupData: {
        title: "Mayor Racha",
        value: "32 Días",
        description: "Tu consistencia más larga registrada sin fallar ningún día del reto."
      }
    },
  ],
  stats: {
    currentDay: 150,
    bestWeight: 78.5,
    longestStreak: 32,
    level: 10,
    xp: 300,
    nextLevelXp: 500
  },
  activities: [
    {
      id: 'a1',
      title: "Reto 1: Cardio Intenso",
      description: "Running matutino + Hidratación",
      hoursSpent: 1.6,
      lastActive: "2 Jan",
      progress: 45, // Barra de progreso
      imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=300&h=150",
      achievementsUnlocked: 2,
      totalAchievements: 55
    },
    {
      id: 'a2',
      title: "Reto 2: Dieta Estricta",
      description: "Sin azúcar, sin alcohol, pura proteína.",
      hoursSpent: 1278, // Horas acumuladas (ejemplo visual)
      lastActive: "1 Jan",
      progress: 78,
      imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=300&h=150",
      achievementsUnlocked: 51,
      totalAchievements: 101
    }
  ]
};

// ==========================================
// 3. SUB-COMPONENTES (ÁTOMOS Y MOLÉCULAS)
// ==========================================
// Pequeñas piezas reutilizables. En un proyecto real, irían en archivos separados.

const StatCard = ({ label, value, unit, theme = 'dark' }: { label: string; value: string | number; unit?: string; theme?: 'dark' | 'light' }) => (
  <div className={`p-2 sm:p-3 rounded border backdrop-blur-sm flex flex-col justify-between h-20 sm:h-24 hover:opacity-95 transition-colors ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-pink-50 border-pink-200'}`}>
    <div className={`text-2xl sm:text-3xl font-light tracking-wide ${theme === 'dark' ? 'text-white' : 'text-pink-700'}`}>
      {value}<span className={`text-sm ml-1 ${theme === 'dark' ? 'text-gray-400' : 'text-pink-600'}`}>{unit}</span>
    </div>
    <div className={`text-xs uppercase tracking-wider font-semibold px-2 py-1 w-fit rounded ${theme === 'dark' ? 'text-gray-400 bg-gray-900/40' : 'text-pink-600 bg-pink-50/80 border border-pink-100'}`}>
      {label}
    </div>
  </div>
);

const LevelBadge = ({ level, xp, nextXp, theme = 'dark' }: { level: number, xp: number, nextXp: number, theme?: 'dark' | 'light' }) => {
  const percentage = Math.min((xp / nextXp) * 100, 100);

  return (
    <div className={`flex items-center space-x-4 p-2 rounded-lg border max-w-xs ${theme === 'dark' ? 'bg-gray-900/60 border-gray-700' : 'bg-pink-50 border-pink-200'}`}>
      <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 text-white font-bold text-lg ${theme === 'dark' ? 'border-red-500 bg-gray-800 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'border-pink-500 bg-pink-600 shadow-[0_0_10px_rgba(219,39,119,0.15)]'}`}>
        {level}
      </div>
      <div className="flex-1">
        <div className={`${theme === 'dark' ? 'text-xs text-gray-300 mb-1' : 'text-xs text-pink-600 mb-1'}`}>Level {level} Badge</div>
        <div className={`w-full h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-pink-100'}`}>
          <div
            className={`${theme === 'dark' ? 'bg-gradient-to-r from-red-600 to-orange-500' : 'bg-pink-500'} h-full`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className={`${theme === 'dark' ? 'text-[10px] text-gray-500 text-right mt-0.5' : 'text-[10px] text-pink-600 text-right mt-0.5'}`}>{xp} / {nextXp} XP</div>
      </div>
    </div>
  );
};

const ActivityRow = ({
  activity,
  ...props
}: {
  activity: ActivityLog
} & React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className="bg-gray-800/40 p-2 sm:p-3 rounded-lg flex flex-col sm:flex-row gap-2 sm:gap-4 border border-gray-700/50 hover:bg-gray-800 transition-all group"
    {...props}
  >
    {/* Imagen tipo Banner de juego */}
    <div className="w-full sm:w-48 h-20 sm:h-24 flex-shrink-0 rounded overflow-hidden relative">
      <img src={activity.imageUrl} alt={activity.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
    </div>

    <div className="flex-1 flex flex-col justify-between py-1">
      <div>
        <h3 className="text-white font-medium text-sm sm:text-lg leading-tight">{activity.title}</h3>
        <p className="text-gray-400 text-xs sm:text-sm">{activity.description}</p>
      </div>

      <div className="space-y-1 sm:space-y-2">
        <div className="flex flex-col sm:flex-row sm:justify-between text-xs text-gray-500 gap-1">
          <span>Achievements Progress {activity.achievementsUnlocked} of {activity.totalAchievements}</span>
          <div className="flex gap-2">
            <span>{activity.hoursSpent} hrs</span>
            <span>last: {activity.lastActive}</span>
          </div>
        </div>
        <div className="w-full bg-gray-700/50 h-1.5 sm:h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-pink-500 to-pink-400 h-full"
            style={{ width: `${activity.progress}%` }}
          />
        </div>
      </div>
    </div>
  </div>
);



// ==========================================
// 4. COMPONENTE PRINCIPAL (PROFILE PAGE)
// ==========================================

const EditProfileModal = ({
  user,
  onSave,
  onClose,
  theme = 'dark'
}: {
  user: { name: string; bio: string; location: string };
  onSave: (data: { name: string; bio: string; location: string }) => void;
  onClose: () => void;
  theme?: 'dark' | 'light';
}) => {
  const [formData, setFormData] = useState(user);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className={`w-full max-w-md p-6 rounded-xl shadow-2xl ${theme === 'dark' ? 'bg-gray-900 border border-gray-700 text-white' : 'bg-white border border-pink-200 text-gray-900'}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Editar Perfil</h2>
          <button onClick={onClose} className={`p-1 rounded-full hover:bg-gray-500/20 transition-colors ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-xs font-medium uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Nombre</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full p-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-pink-500'} focus:ring-2 focus:ring-opacity-50 outline-none transition-all`}
            />
          </div>

          <div>
            <label className={`block text-xs font-medium uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Ubicación</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className={`w-full p-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-pink-500'} focus:ring-2 focus:ring-opacity-50 outline-none transition-all`}
            />
          </div>

          <div>
            <label className={`block text-xs font-medium uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className={`w-full p-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-pink-500'} focus:ring-2 focus:ring-opacity-50 outline-none transition-all resize-none`}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-6 py-2 rounded-lg text-sm font-medium text-white shadow-lg transition-transform active:scale-95 ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20' : 'bg-pink-500 hover:bg-pink-600 shadow-pink-200'}`}
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function Profile({ theme = 'dark', isModal = false, onClose }: ProfileProps) {
  const { isLoggedIn, currentUser, login, register, logout, updateProfile } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [selectedBadge, setSelectedBadge] = useState<Achievement | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Si no está logueado, mostrar la pantalla de autenticación
  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen ${isModal ? 'h-[90vh]' : ''} flex items-center justify-center p-4 ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-gray-900'
        }`}>
        <div className="w-full max-w-md">
          {authView === 'login' ? (
            <Login
              theme={theme}
              onLogin={login}
              onSwitchToRegister={() => setAuthView('register')}
            />
          ) : (
            <Register
              theme={theme}
              onRegister={register}
              onSwitchToLogin={() => setAuthView('login')}
            />
          )}
        </div>
      </div>
    );
  }

  // Usuario logueado - usar datos del usuario actual o datos de demo
  const displayUser = currentUser ? {
    ...USER_DATA,
    username: currentUser.name,
    email: currentUser.email,
    avatarUrl: currentUser.avatarUrl || USER_DATA.avatarUrl,
    bio: currentUser.bio || USER_DATA.bio,
    location: currentUser.location || USER_DATA.location
  } : USER_DATA;
  const { username, handle, stats, activities, badges, location, status } = displayUser;

  const rootClass = isModal
    ? `w-full h-full p-2 sm:p-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`
    : `min-h-screen p-2 sm:p-4 md:p-8 flex justify-center md:items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`;

  const cardBg = theme === 'dark'
    ? 'bg-gradient-to-br from-pink-950/90 to-black/90 border-pink-500/20'
    : 'bg-gradient-to-br from-pink-50/95 to-white/95 border-pink-200';

  return (
    <div className={rootClass}>
      {isEditingProfile && (
        <EditProfileModal
          user={{
            name: displayUser.username,
            bio: displayUser.bio,
            location: displayUser.location
          }}
          onSave={(data) => {
            updateProfile(data);
            setIsEditingProfile(false);
          }}
          onClose={() => setIsEditingProfile(false)}
          theme={theme}
        />
      )}
      {/* Main Content Wrapper - Limit width similar to Steam's layout */}
      <div className={`w-full ${isModal ? 'max-w-4xl mx-auto h-[90vh] overflow-y-auto' : 'max-w-5xl'} ${cardBg} backdrop-blur-md rounded-lg shadow-2xl relative`}>

        {/* Decorative Gradient Top */}
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-[#2a475e] to-transparent opacity-50 pointer-events-none" />

        <div className="relative z-10 p-3 sm:p-6 flex flex-col gap-4 sm:gap-6">

          {/* Top Right Actions (Logout & Close) */}
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
            <button
              onClick={logout}
              className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${theme === 'dark' ? 'bg-black/40 text-pink-300 hover:bg-black/30' : 'bg-white/60 text-pink-600 hover:bg-white/70'
                }`}>
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Cerrar sesión</span>
            </button>

            {isModal && onClose && (
              <button
                onClick={onClose}
                aria-label="Cerrar perfil"
                className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'bg-black/40 text-pink-300 hover:bg-black/30' : 'bg-white/60 text-pink-600 hover:bg-white/70'}`}>
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* ================= LEFT COLUMN (Avatar & Info) ================= */}
          <div className="flex-1 space-y-4 sm:space-y-6">

            {/* Header Profile Info */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-8">
              <div className="relative mx-auto sm:mx-0">
                <div className="w-24 h-24 sm:w-32 sm:h-32 border-2 border-[#5c7e10] p-1 bg-gradient-to-b from-[#5c7e10] to-transparent">
                  <img
                    src={currentUser?.avatarUrl || USER_DATA.avatarUrl}
                    alt={`Avatar de ${currentUser?.name || username}`}
                    className="w-full h-full object-cover bg-black"
                    loading="lazy"
                    width={96}
                    height={96}
                  />
                </div>
                {/* Status indicator */}
                <span
                  className={`absolute bottom-2 right-2 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-[#171a21] ${status === 'online' ? 'bg-blue-400' : 'bg-gray-500'}`}
                  title={status === 'online' ? 'En línea' : 'Desconectado'}
                  aria-label={status === 'online' ? 'En línea' : 'Desconectado'}
                ></span>
              </div>

              <div className="flex flex-col justify-start pt-0 sm:pt-2 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl text-white font-bold tracking-tight">
                  {currentUser?.name || username}
                </h1>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-400 mb-2">
                  <span>{currentUser?.email || handle}</span>
                  <MapPin size={14} />
                  <span>{location}</span>
                </div>
                <p className="text-gray-400 text-sm max-w-md mb-3 sm:mb-4 italic text-center sm:text-left">
                  "{currentUser ? 'Miembro activo del 75 Hard Challenge' : USER_DATA.bio}"
                </p>
                <div className="flex justify-center sm:justify-start">
                  <a href="#" className="text-xs text-blue-400 hover:text-white transition-colors">View more info</a>
                </div>
              </div>
            </div>

            {/* Stats Row (Days, Weight, Streak) */}
            <section className="mb-4 sm:mb-8">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-white text-base sm:text-lg font-light">Estadísticas</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                <StatCard label="Días Actuales" value={stats.currentDay} />
                <StatCard label="Mejor Peso" value={stats.bestWeight} unit="kg" />
                <StatCard label="Mayor Racha" value={stats.longestStreak} unit="días" />
              </div>
            </section>

            {/* Level Badge Box y Currently Online - Alineados horizontalmente */}
            <div className="flex flex-col lg:flex-row gap-4 mb-4 sm:mb-8">
              {/* Level Badge Box */}
              <div className={`flex-1 ${theme === 'dark' ? 'bg-[#12151a]/50' : 'bg-pink-50/80'} p-4 sm:p-6 rounded-lg`}>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4">
                  <h3 className={`${theme === 'dark' ? 'text-lg sm:text-xl text-white' : 'text-lg sm:text-xl text-pink-700'} font-light mb-2 sm:mb-0`}>Level <span className="font-bold">{stats.level}</span></h3>
                </div>
                <div className="mb-3 sm:mb-4">
                  <LevelBadge level={stats.level} xp={stats.xp} nextXp={stats.nextLevelXp} theme={theme} />
                </div>
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className={`${theme === 'dark' ? 'text-xs bg-[#21262d] hover:bg-[#2a3038] text-white py-2 px-4 rounded border border-gray-600' : 'text-xs bg-pink-100 text-pink-700 hover:bg-pink-200 py-2 px-4 rounded border border-pink-200'} w-fit transition-colors`}
                >
                  Edit Profile
                </button>
              </div>

              {/* Online Status Section */}
              <div className={`lg:w-80 ${theme === 'dark' ? 'bg-[#12151a]/30 p-4 rounded border border-gray-800' : 'bg-pink-50 p-4 rounded border border-pink-200'}`}>
                <h3 className={`${theme === 'dark' ? 'text-blue-400' : 'text-pink-600'} text-lg mb-1`}>Currently Online</h3>

                {/* Backdrop for closing popover */}
                {selectedBadge && (
                  <div
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setSelectedBadge(null)}
                  />
                )}

                <div className="flex gap-2 mb-6 relative z-50">
                  {badges.map((badge) => (
                    <div key={badge.id} className="relative">
                      <button
                        onClick={() => setSelectedBadge(selectedBadge?.id === badge.id ? null : badge)}
                        title={badge.name}
                        className={`${theme === 'dark' ? 'bg-gray-800 p-1 rounded border border-gray-600 hover:border-white text-yellow-500 hover:bg-gray-700' : 'bg-white p-1 rounded border border-pink-100 text-pink-600 hover:bg-pink-50'} cursor-pointer transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 ${selectedBadge?.id === badge.id ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900' : ''}`}
                      >
                        {badge.icon}
                      </button>

                      {/* Popover */}
                      {selectedBadge?.id === badge.id && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 z-50 animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                          <div className="bg-black/90 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-xl text-center relative after:content-[''] after:absolute after:bottom-full after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-transparent after:border-b-black/90">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">{badge.popupData.title}</h4>
                            <div className="text-xl font-bold text-blue-400 mb-1">{badge.popupData.value}</div>
                            <p className="text-[10px] text-gray-300 leading-tight">{badge.popupData.description}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Sidebar Menu Links */}
                <nav className="flex flex-col gap-1 text-sm">
                  <div className="flex justify-between group cursor-pointer">
                    <span className="text-gray-400 group-hover:text-white">Challenges</span>
                    <span className="text-gray-600 group-hover:text-gray-400">150</span>
                  </div>
                  <div className="flex justify-between group cursor-pointer">
                    <span className="text-gray-400 group-hover:text-white">Inventory</span>
                    <span className="text-gray-600 group-hover:text-gray-400"></span>
                  </div>
                  <div className="flex justify-between group cursor-pointer">
                    <span className="text-gray-400 group-hover:text-white">Screenshots</span>
                    <span className="text-gray-600 group-hover:text-gray-400">12</span>
                  </div>
                  <div className="flex justify-between group cursor-pointer">
                    <span className="text-gray-400 group-hover:text-white">Videos</span>
                    <span className="text-gray-600 group-hover:text-gray-400"></span>
                  </div>
                  <div className="flex justify-between group cursor-pointer">
                    <span className="text-gray-400 group-hover:text-white">Reviews</span>
                    <span className="text-gray-600 group-hover:text-gray-400">2</span>
                  </div>
                </nav>
              </div>
            </div>

            {/* Featured Showcase (Simulado como Featured Games) */}
            <section className="mb-4 sm:mb-8">
              <h2 className="text-gray-400 text-xs sm:text-sm mb-2 font-medium">FEATURED CHALLENGES</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <button
                    key={i}
                    className="aspect-video bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer border border-transparent hover:border-blue-500 rounded relative overflow-hidden group focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label={`Desafío destacado ${i}`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center text-gray-600 group-hover:text-gray-300">
                      <Gamepad2 size={16} sm:size={24} aria-hidden="true" />
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Recent Activity */}
            <section>
              <div className="flex justify-between items-end mb-2">
                <h2 className={`${theme === 'dark' ? 'text-white' : 'text-pink-700'} text-base sm:text-lg`}>Actividad Reciente</h2>
                <span className={`${theme === 'dark' ? 'text-xs text-gray-500' : 'text-xs text-pink-600'}`}>4.4 hours past 2 weeks</span>
              </div>
              <div className="flex flex-col gap-2 sm:gap-3">
                {activities.map(activity => (
                  <ActivityRow key={activity.id} activity={activity} />
                ))}
              </div>
            </section>

            {/* Comments Section */}
            <section className="mt-6 sm:mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className={`${theme === 'dark' ? 'text-white' : 'text-pink-700'} text-base sm:text-lg`}>Comentarios</h2>
                <span className={`${theme === 'dark' ? 'text-xs text-gray-500' : 'text-xs text-pink-600'}`}>12 comentarios</span>
              </div>

              {/* Comment Input */}
              <div className={`${theme === 'dark' ? 'bg-[#12151a]/50' : 'bg-pink-50/80'} p-4 rounded-lg mb-4`}>
                <textarea
                  placeholder="Escribe un comentario..."
                  className={`w-full p-3 rounded border ${theme === 'dark' ? 'bg-[#21262d] border-gray-600 text-white placeholder-gray-400' : 'bg-white border-pink-200 text-gray-900 placeholder-gray-500'} resize-none focus:outline-none focus:ring-2 focus:ring-pink-500`}
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <button className={`${theme === 'dark' ? 'bg-pink-600 hover:bg-pink-700' : 'bg-pink-500 hover:bg-pink-600'} text-white px-4 py-2 rounded text-sm transition-colors`}>
                    Publicar comentario
                  </button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-3">
                {/* Comment 1 */}
                <div className={`${theme === 'dark' ? 'bg-[#12151a]/30' : 'bg-pink-50/60'} p-4 rounded-lg`}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      JD
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Juan Díaz</span>
                        <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-xs`}>Hace 2 horas</span>
                      </div>
                      <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-sm`}>
                        ¡Excelente progreso con el desafío! Sigue así, estás muy cerca de completarlo. La constancia es la clave del éxito.
                      </p>
                      <div className="flex gap-4 mt-2">
                        <button className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} text-xs transition-colors`}>
                          👍 Útil (3)
                        </button>
                        <button className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} text-xs transition-colors`}>
                          Responder
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comment 2 */}
                <div className={`${theme === 'dark' ? 'bg-[#12151a]/30' : 'bg-pink-50/60'} p-4 rounded-lg`}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
                      MG
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>María García</span>
                        <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-xs`}>Hace 5 horas</span>
                      </div>
                      <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-sm`}>
                        ¿Cómo llevas la parte de la dieta? Yo estoy luchando con ese aspecto del desafío. ¡Ánimo!
                      </p>
                      <div className="flex gap-4 mt-2">
                        <button className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} text-xs transition-colors`}>
                          👍 Útil (1)
                        </button>
                        <button className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} text-xs transition-colors`}>
                          Responder
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comment 3 */}
                <div className={`${theme === 'dark' ? 'bg-[#12151a]/30' : 'bg-pink-50/60'} p-4 rounded-lg`}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                      CR
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Carlos Rodríguez</span>
                        <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-xs`}>Ayer</span>
                      </div>
                      <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-sm`}>
                        ¡Increíble motivación! Tu dedicación es inspiradora. ¿Podrías compartir algunos consejos para mantener la disciplina?
                      </p>
                      <div className="flex gap-4 mt-2">
                        <button className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} text-xs transition-colors`}>
                          👍 Útil (5)
                        </button>
                        <button className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} text-xs transition-colors`}>
                          Responder
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Load More Comments */}
              <div className="text-center mt-4">
                <button className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} text-sm transition-colors`}>
                  Cargar más comentarios...
                </button>
              </div>
            </section>

          </div>

          {/* ================= RIGHT COLUMN (Sidebar) ================= */}
          <aside className="w-full md:w-72 flex flex-col gap-4 sm:gap-6">

          </aside>
        </div>
      </div>
    </div>
  );
}