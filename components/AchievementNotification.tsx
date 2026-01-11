import React from 'react';
import { Icon } from './Icons';

interface AchievementNotificationProps {
  achievement: {
    id: string;
    title: string;
    description: string;
    icon: string;
    points: number;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  };
  theme: 'dark' | 'light';
  isVisible: boolean;
}

const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  theme,
  isVisible
}) => {
  const getRarityColors = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return {
          bg: theme === 'dark' ? 'from-gray-900 to-gray-800' : 'from-gray-100 to-gray-50',
          border: theme === 'dark' ? 'border-gray-600' : 'border-gray-400',
          text: theme === 'dark' ? 'text-gray-300' : 'text-gray-700',
          glow: theme === 'dark' ? 'shadow-gray-500/20' : 'shadow-gray-400/30',
          icon: theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        };
      case 'rare':
        return {
          bg: theme === 'dark' ? 'from-blue-900 to-blue-800' : 'from-blue-100 to-blue-50',
          border: theme === 'dark' ? 'border-blue-500' : 'border-blue-400',
          text: theme === 'dark' ? 'text-blue-300' : 'text-blue-700',
          glow: theme === 'dark' ? 'shadow-blue-500/30' : 'shadow-blue-400/40',
          icon: theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
        };
      case 'epic':
        return {
          bg: theme === 'dark' ? 'from-purple-900 to-purple-800' : 'from-purple-100 to-purple-50',
          border: theme === 'dark' ? 'border-purple-500' : 'border-purple-400',
          text: theme === 'dark' ? 'text-purple-300' : 'text-purple-700',
          glow: theme === 'dark' ? 'shadow-purple-500/30' : 'shadow-purple-400/40',
          icon: theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
        };
      case 'legendary':
        return {
          bg: theme === 'dark' ? 'from-yellow-900 to-yellow-800' : 'from-yellow-100 to-yellow-50',
          border: theme === 'dark' ? 'border-yellow-500' : 'border-yellow-400',
          text: theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700',
          glow: theme === 'dark' ? 'shadow-yellow-500/40' : 'shadow-yellow-400/50',
          icon: theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
        };
      default:
        return {
          bg: theme === 'dark' ? 'from-gray-900 to-gray-800' : 'from-gray-100 to-gray-50',
          border: theme === 'dark' ? 'border-gray-600' : 'border-gray-400',
          text: theme === 'dark' ? 'text-gray-300' : 'text-gray-700',
          glow: theme === 'dark' ? 'shadow-gray-500/20' : 'shadow-gray-400/30',
          icon: theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        };
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return '○';
      case 'rare': return '◆';
      case 'epic': return '★';
      case 'legendary': return '✦';
      default: return '○';
    }
  };

  const colors = getRarityColors(achievement.rarity);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] animate-in slide-in-from-right-2 fade-in duration-500">
      <div className={`relative bg-gradient-to-br ${colors.bg} border-2 ${colors.border} rounded-2xl p-4 shadow-2xl ${colors.glow} backdrop-blur-sm max-w-sm`}>
        {/* Animated Glow Effect */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${colors.glow} opacity-50 animate-pulse`} />
        
        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold ${colors.text}`}>
                {getRarityIcon(achievement.rarity)}
              </span>
              <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
                ¡LOGRO DESBLOQUEADO!
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="star" className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-bold text-yellow-500">
                +{achievement.points}
              </span>
            </div>
          </div>

          {/* Achievement Info */}
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors.bg} border ${colors.border} flex items-center justify-center flex-shrink-0`}>
              <Icon 
                name={achievement.icon} 
                className={`w-5 h-5 ${colors.icon}`} 
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-bold text-sm mb-1 ${colors.text} truncate`}>
                {achievement.title}
              </h3>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>
                {achievement.description}
              </p>
            </div>
          </div>

          {/* Celebration Particles */}
          <div className="absolute -top-1 -left-1 -right-1 -bottom-1 pointer-events-none overflow-hidden rounded-2xl">
            <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-yellow-400 rounded-full animate-ping" />
            <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-yellow-400 rounded-full animate-ping animation-delay-200" />
            <div className="absolute bottom-1/4 left-3/4 w-1 h-1 bg-yellow-400 rounded-full animate-ping animation-delay-400" />
            <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-yellow-400 rounded-full animate-ping animation-delay-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementNotification;
