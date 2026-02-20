import React, { useState, useEffect } from 'react';
import { Icon } from './Icons';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'daily' | 'milestone' | 'special' | 'perfect';
  requirement: {
    type: 'days' | 'streak' | 'perfect_day' | 'total_days' | 'special';
    value: number;
  };
  points: number;
  unlocked: boolean;
  unlockedAt?: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementsProps {
  theme: 'dark' | 'light';
  isOpen: boolean;
  onClose: () => void;
  userProgress: {
    currentDay: number;
    currentStreak: number;
    totalDaysCompleted: number;
    perfectDays: number;
    achievements: string[];
  };
}

const ACHIEVEMENTS: Achievement[] = [
  // Daily Achievements (Common)
  {
    id: 'first_day',
    title: 'Primer Paso',
    description: 'Completa tu primer día del desafío',
    icon: 'star',
    category: 'daily',
    requirement: { type: 'days', value: 1 },
    points: 10,
    unlocked: false,
    rarity: 'common'
  },
  {
    id: 'week_warrior',
    title: 'Guerrero de la Semana',
    description: 'Completa 7 días consecutivos',
    icon: 'calendar',
    category: 'daily',
    requirement: { type: 'streak', value: 7 },
    points: 50,
    unlocked: false,
    rarity: 'common'
  },
  {
    id: 'two_weeks',
    title: 'Quincena Perfecta',
    description: 'Mantén el ritmo por 14 días',
    icon: 'target',
    category: 'daily',
    requirement: { type: 'streak', value: 14 },
    points: 100,
    unlocked: false,
    rarity: 'common'
  },
  {
    id: 'month_master',
    title: 'Maestro del Mes',
    description: '30 días de dedicación total',
    icon: 'moon',
    category: 'daily',
    requirement: { type: 'streak', value: 30 },
    points: 200,
    unlocked: false,
    rarity: 'rare'
  },

  // Milestone Achievements (Rare)
  {
    id: 'halfway_there',
    title: 'A Mitad de Camino',
    description: 'Alcanza el día 37 del desafío',
    icon: 'zap',
    category: 'milestone',
    requirement: { type: 'days', value: 37 },
    points: 300,
    unlocked: false,
    rarity: 'rare'
  },
  {
    id: 'five_days_champion',
    title: 'Campeón de 5 Días',
    description: 'Completa exitosamente 5 días del desafío',
    icon: 'trophy',
    category: 'milestone',
    requirement: { type: 'days', value: 5 },
    points: 75,
    unlocked: false,
    rarity: 'common'
  },
  {
    id: 'ten_days_veteran',
    title: 'Veterano de 10 Días',
    description: 'Demuestra consistencia por 10 días',
    icon: 'shield',
    category: 'milestone',
    requirement: { type: 'days', value: 10 },
    points: 150,
    unlocked: false,
    rarity: 'rare'
  },

  // Perfect Day Achievements (Epic)
  {
    id: 'first_perfect',
    title: 'Día Impecable',
    description: 'Completa todas las tareas perfectamente en un día',
    icon: 'heart',
    category: 'perfect',
    requirement: { type: 'perfect_day', value: 1 },
    points: 250,
    unlocked: false,
    rarity: 'epic'
  },
  {
    id: 'week_perfectionist',
    title: 'Perfeccionista Semanal',
    description: '7 días perfectos en una semana',
    icon: 'star',
    category: 'perfect',
    requirement: { type: 'perfect_day', value: 7 },
    points: 500,
    unlocked: false,
    rarity: 'epic'
  },

  // Special Achievements (Legendary)
  {
    id: 'challenge_complete',
    title: 'Leyenda del 75 HARD',
    description: 'Completa exitosamente todo el desafío de 75 días',
    icon: 'crown',
    category: 'special',
    requirement: { type: 'total_days', value: 75 },
    points: 1000,
    unlocked: false,
    rarity: 'legendary'
  },
  {
    id: 'no_cheat_code',
    title: 'Puro Corazón',
    description: 'Completa 50 días sin saltarte ninguna tarea',
    icon: 'shield',
    category: 'special',
    requirement: { type: 'special', value: 50 },
    points: 750,
    unlocked: false,
    rarity: 'legendary'
  },
  {
    id: 'early_bird',
    title: 'Madrugador Digital',
    description: 'Completa todas las tareas antes de las 8 AM por 5 días seguidos',
    icon: 'sun',
    category: 'special',
    requirement: { type: 'special', value: 5 },
    points: 400,
    unlocked: false,
    rarity: 'epic'
  }
];

const Achievements: React.FC<AchievementsProps> = ({ 
  theme, 
  isOpen, 
  onClose, 
  userProgress 
}) => {
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'daily' | 'milestone' | 'special' | 'perfect'>('all');
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);

  // Check for unlocked achievements
  useEffect(() => {
    const updatedAchievements = achievements.map(achievement => {
      const isUnlocked = checkIfUnlocked(achievement, userProgress);
      const wasUnlocked = userProgress.achievements.includes(achievement.id);
      
      if (isUnlocked && !wasUnlocked) {
        setNewlyUnlocked(prev => [...prev, achievement.id]);
        // Show notification for new achievement
        setTimeout(() => {
          setNewlyUnlocked(prev => prev.filter(id => id !== achievement.id));
        }, 5000);
      }
      
      return {
        ...achievement,
        unlocked: isUnlocked,
        unlockedAt: isUnlocked && !wasUnlocked ? new Date() : achievement.unlockedAt
      };
    });
    
    setAchievements(updatedAchievements);
  }, [userProgress]);

  const checkIfUnlocked = (achievement: Achievement, progress: typeof userProgress): boolean => {
    switch (achievement.requirement.type) {
      case 'days':
        return progress.currentDay >= achievement.requirement.value;
      case 'streak':
        return progress.currentStreak >= achievement.requirement.value;
      case 'perfect_day':
        return progress.perfectDays >= achievement.requirement.value;
      case 'total_days':
        return progress.totalDaysCompleted >= achievement.requirement.value;
      case 'special':
        // Special cases would be handled by specific game logic
        return false; // Placeholder
      default:
        return false;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return theme === 'dark' ? 'border-gray-600 bg-gray-800/50' : 'border-gray-400 bg-gray-100';
      case 'rare':
        return theme === 'dark' ? 'border-blue-500 bg-blue-900/50' : 'border-blue-400 bg-blue-100';
      case 'epic':
        return theme === 'dark' ? 'border-purple-500 bg-purple-900/50' : 'border-purple-400 bg-purple-100';
      case 'legendary':
        return theme === 'dark' ? 'border-yellow-500 bg-yellow-900/50' : 'border-yellow-400 bg-yellow-100';
      default:
        return theme === 'dark' ? 'border-gray-600 bg-gray-800/50' : 'border-gray-400 bg-gray-100';
    }
  };

  const getRarityTextColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
      case 'rare':
        return theme === 'dark' ? 'text-blue-300' : 'text-blue-700';
      case 'epic':
        return theme === 'dark' ? 'text-purple-300' : 'text-purple-700';
      case 'legendary':
        return theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700';
      default:
        return theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return '○';
      case 'rare':
        return '◆';
      case 'epic':
        return '★';
      case 'legendary':
        return '✦';
      default:
        return '○';
    }
  };

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const totalPoints = achievements
    .filter(a => a.unlocked)
    .reduce((sum, a) => sum + a.points, 0);

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] sm:z-[50] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-3xl border backdrop-blur-sm transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-purple-950/95 to-black/95 border-purple-500/20'
          : 'bg-gradient-to-br from-purple-50/95 to-white/95 border-purple-200'
      }`}>
        {/* Background Glow */}
        <div className={`absolute -top-40 -right-40 w-96 h-96 blur-[120px] rounded-full pointer-events-none transition-opacity duration-300 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-purple-400/20 to-purple-600/10'
            : 'bg-gradient-to-br from-purple-200/15 to-purple-300/10'
        }`} />

        <div className="relative z-10 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-6 border-b border-purple-500/20">
            <div className="flex items-center gap-2 sm:gap-3">
              <Icon name="trophy" className="w-4 h-4 sm:w-6 sm:h-6 text-purple-500" />
              <h2 className={`text-base sm:text-2xl font-bold transition-colors duration-300 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Logros y Desafíos
              </h2>
            </div>
            
            <button
              onClick={onClose}
              className={`p-2 sm:p-3 rounded-xl transition-all duration-300 ${
                theme === 'dark' 
                  ? 'hover:bg-purple-950/50 text-purple-300 hover:text-purple-200 border border-purple-500/20' 
                  : 'hover:bg-purple-100 text-purple-600 hover:text-purple-500 border border-purple-200'
              }`}
            >
              <Icon name="x" className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Stats Summary */}
          <div className={`p-3 sm:p-6 border-b border-purple-500/20 ${
            theme === 'dark' ? 'bg-purple-950/20' : 'bg-purple-50/20'
          }`}>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="text-center">
                <div className={`text-xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>
                  {unlockedCount}
                </div>
                <div className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Logros Desbloqueados
                </div>
              </div>
              <div className="text-center">
                <div className={`text-xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>
                  {totalPoints}
                </div>
                <div className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Puntos Totales
                </div>
              </div>
              <div className="text-center">
                <div className={`text-xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>
                  {userProgress.currentStreak}
                </div>
                <div className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Racha Actual
                </div>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-1 sm:gap-2 p-3 sm:p-4 border-b border-purple-500/20">
            {[
              { id: 'all', label: 'Todos', icon: 'grid' },
              { id: 'daily', label: 'Diarios', icon: 'calendar' },
              { id: 'milestone', label: 'Hitos', icon: 'target' },
              { id: 'perfect', label: 'Perfectos', icon: 'star' },
              { id: 'special', label: 'Especiales', icon: 'trophy' }
            ].map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id as any)}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-200 ${
                  selectedCategory === category.id
                    ? theme === 'dark' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-purple-500 text-white'
                    : theme === 'dark'
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon name={category.icon} className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium">{category.label}</span>
              </button>
            ))}
          </div>

          {/* Achievements Grid */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 max-h-[calc(90vh-240px)] scrollbar-thin scrollbar-thumb-purple-500/20 scrollbar-track-transparent hover:scrollbar-thumb-purple-500/40">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {filteredAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`relative group cursor-pointer transition-all duration-300 ${
                    achievement.unlocked
                      ? 'opacity-100'
                      : 'opacity-50'
                  }`}
                >
                  {/* Achievement Card */}
                  <div className={`relative rounded-xl sm:rounded-2xl border-2 p-3 sm:p-4 transition-all duration-300 ${
                    getRarityColor(achievement.rarity)
                  } ${
                    achievement.unlocked
                      ? 'hover:scale-105'
                      : 'hover:scale-102'
                  } ${
                    newlyUnlocked.includes(achievement.id)
                      ? 'animate-pulse ring-4 ring-purple-400/50'
                      : ''
                  }`}>
                    {/* Rarity Indicator */}
                    <div className="absolute top-1 sm:top-2 right-1 sm:right-2">
                      <span className={`text-sm sm:text-lg font-bold ${getRarityTextColor(achievement.rarity)}`}>
                        {getRarityIcon(achievement.rarity)}
                      </span>
                    </div>

                    {/* Achievement Icon */}
                    <div className="flex items-center justify-center mb-2 sm:mb-3">
                      <Icon 
                        name={achievement.icon} 
                        className={`w-6 h-6 sm:w-8 sm:h-8 ${
                          achievement.unlocked
                            ? getRarityTextColor(achievement.rarity)
                            : theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                        }`} 
                      />
                    </div>

                    {/* Achievement Info */}
                    <div className="text-center">
                      <h3 className={`font-bold text-xs sm:text-sm mb-1 ${
                        achievement.unlocked
                          ? getRarityTextColor(achievement.rarity)
                          : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {achievement.title}
                      </h3>
                      <p className={`text-xs mb-1 sm:mb-2 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {achievement.description}
                      </p>
                      
                      {/* Requirement */}
                      <div className={`text-xs font-medium mb-1 sm:mb-2 ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        {achievement.requirement.type === 'days' && `Día ${achievement.requirement.value}`}
                        {achievement.requirement.type === 'streak' && `${achievement.requirement.value} días seguidos`}
                        {achievement.requirement.type === 'perfect_day' && `${achievement.requirement.value} días perfectos`}
                        {achievement.requirement.type === 'total_days' && `${achievement.requirement.value} días totales`}
                      </div>

                      {/* Points */}
                      <div className="flex items-center justify-center gap-1 mt-1 sm:mt-2">
                        <Icon name="star" className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                        <span className={`text-xs font-bold ${
                          achievement.unlocked
                            ? 'text-yellow-500'
                            : theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          {achievement.points} pts
                        </span>
                      </div>
                    </div>

                    {/* Lock/Unlocked Status */}
                    <div className="absolute top-1 sm:top-2 left-1 sm:left-2">
                      {achievement.unlocked ? (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <Icon name="check" className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-500 rounded-full flex items-center justify-center">
                          <Icon name="lock" className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end p-3 sm:p-6 border-t border-purple-500/20">
            <button
              onClick={onClose}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all duration-300 font-medium text-sm sm:text-base ${
                theme === 'dark'
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
              }`}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Achievements;
