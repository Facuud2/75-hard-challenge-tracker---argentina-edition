import React, { useState, useEffect, useCallback } from 'react';
import AchievementNotification from '../components/AchievementNotification';

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
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface UserProgress {
  currentDay: number;
  currentStreak: number;
  totalDaysCompleted: number;
  perfectDays: number;
  achievements: string[];
}

const ACHIEVEMENTS: Achievement[] = [
  // Daily Achievements
  {
    id: 'first_day',
    title: 'Primer Paso',
    description: 'Completa tu primer día del desafío',
    icon: 'star',
    category: 'daily',
    requirement: { type: 'days', value: 2 },
    points: 10,
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
    rarity: 'rare'
  },

  // Milestone Achievements
  {
    id: 'five_days_champion',
    title: 'Campeón de 5 Días',
    description: 'Completa exitosamente 5 días del desafío',
    icon: 'trophy',
    category: 'milestone',
    requirement: { type: 'days', value: 5 },
    points: 75,
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
    rarity: 'rare'
  },
  {
    id: 'halfway_there',
    title: 'A Mitad de Camino',
    description: 'Alcanza el día 37 del desafío',
    icon: 'zap',
    category: 'milestone',
    requirement: { type: 'days', value: 37 },
    points: 300,
    rarity: 'rare'
  },

  // Perfect Day Achievements
  {
    id: 'first_perfect',
    title: 'Día Impecable',
    description: 'Completa todas las tareas perfectamente en un día',
    icon: 'heart',
    category: 'perfect',
    requirement: { type: 'perfect_day', value: 1 },
    points: 250,
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
    rarity: 'epic'
  },

  // Special Achievements
  {
    id: 'challenge_complete',
    title: 'Leyenda del 75 HARD',
    description: 'Completa exitosamente todo el desafío de 75 días',
    icon: 'crown',
    category: 'special',
    requirement: { type: 'total_days', value: 75 },
    points: 1000,
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
    rarity: 'legendary'
  }
];

export const useAchievementsSimple = (theme: 'dark' | 'light', userProgress: UserProgress) => {
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(userProgress.achievements);
  const [currentNotification, setCurrentNotification] = useState<Achievement | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  // Load achievements from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('75hard_achievements');
      if (saved) {
        const parsed = JSON.parse(saved);
        setUnlockedAchievements(parsed);
      }
    } catch (e) {
      console.error('Error loading achievements:', e);
    }
  }, []);

  // Load shown notifications from localStorage on mount
  const getShownNotifications = useCallback(() => {
    try {
      const saved = localStorage.getItem('75hard_shown_notifications');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading shown notifications:', e);
    }
    return [];
  }, []);

  const markNotificationAsShown = useCallback((achievementId: string) => {
    try {
      const shown = getShownNotifications();
      if (!shown.includes(achievementId)) {
        const updated = [...shown, achievementId];
        localStorage.setItem('75hard_shown_notifications', JSON.stringify(updated));
      }
    } catch (e) {
      console.error('Error saving shown notification:', e);
    }
  }, [getShownNotifications]);

  // Save achievements to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('75hard_achievements', JSON.stringify(unlockedAchievements));
    } catch (e) {
      console.error('Error saving achievements:', e);
    }
  }, [unlockedAchievements]);

  const checkIfUnlocked = useCallback((achievement: Achievement, progress: UserProgress): boolean => {
    if (unlockedAchievements.includes(achievement.id)) {
      return true;
    }

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
        return false;
      default:
        return false;
    }
  }, [unlockedAchievements]);

  const unlockAchievement = useCallback((achievementId: string) => {
    if (!unlockedAchievements.includes(achievementId)) {
      const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
      if (achievement) {
        setUnlockedAchievements(prev => [...prev, achievementId]);
        showAchievementNotification(achievement);
      }
    }
  }, [unlockedAchievements]);

  const showAchievementNotification = useCallback((achievement: Achievement) => {
    // Check if notification was already shown
    const shownNotifications = getShownNotifications();
    if (shownNotifications.includes(achievement.id)) {
      console.log(`Notification for ${achievement.id} already shown, skipping`);
      return;
    }

    setCurrentNotification(achievement);
    setShowNotification(true);

    // Mark as shown immediately
    markNotificationAsShown(achievement.id);

    // Play sound effect
    playAchievementSound(achievement.rarity);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      setShowNotification(false);
      setTimeout(() => {
        setCurrentNotification(null);
      }, 500);
    }, 5000);
  }, [getShownNotifications, markNotificationAsShown]);

  const playAchievementSound = useCallback((rarity: string) => {
    try {
      const audio = new Audio('/effectsund.mp4');
      audio.volume = 0.5; // Ajustar volumen si es necesario
      audio.play().catch(e => {
        console.log('Audio play failed:', e);
      });
    } catch (e) {
      console.log('Audio creation failed:', e);
    }
  }, []);

  const checkAndUnlockAchievements = useCallback((progress: UserProgress) => {
    ACHIEVEMENTS.forEach(achievement => {
      if (checkIfUnlocked(achievement, progress) && !unlockedAchievements.includes(achievement.id)) {
        unlockAchievement(achievement.id);
      }
    });
  }, [checkIfUnlocked, unlockAchievement, unlockedAchievements]);

  // Check achievements when progress changes
  useEffect(() => {
    checkAndUnlockAchievements(userProgress);
  }, [userProgress, checkAndUnlockAchievements]);

  const getAchievementStats = useCallback(() => {
    const unlocked = ACHIEVEMENTS.filter(a => unlockedAchievements.includes(a.id));
    const totalPoints = unlocked.reduce((sum, a) => sum + a.points, 0);
    
    return {
      totalUnlocked: unlocked.length,
      totalAchievements: ACHIEVEMENTS.length,
      totalPoints,
      byRarity: {
        common: unlocked.filter(a => a.rarity === 'common').length,
        rare: unlocked.filter(a => a.rarity === 'rare').length,
        epic: unlocked.filter(a => a.rarity === 'epic').length,
        legendary: unlocked.filter(a => a.rarity === 'legendary').length,
      }
    };
  }, [unlockedAchievements]);

  const getUnlockedAchievements = useCallback(() => {
    return ACHIEVEMENTS.filter(a => unlockedAchievements.includes(a.id));
  }, [unlockedAchievements]);

  const clearShownNotifications = useCallback(() => {
    try {
      localStorage.removeItem('75hard_shown_notifications');
      console.log('Shown notifications cleared');
    } catch (e) {
      console.error('Error clearing shown notifications:', e);
    }
  }, []);

  return {
    unlockedAchievements,
    currentNotification,
    showNotification,
    unlockAchievement,
    checkAndUnlockAchievements,
    getAchievementStats,
    getUnlockedAchievements,
    clearShownNotifications,
    AchievementNotificationComponent: () => {
      if (currentNotification && showNotification) {
        return React.createElement(AchievementNotification, {
          achievement: currentNotification,
          theme: theme,
          isVisible: showNotification
        });
      }
      return null;
    }
  };
};

export default useAchievementsSimple;
export { ACHIEVEMENTS };
