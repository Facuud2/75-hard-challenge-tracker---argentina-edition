import React from 'react';
import { Icon } from './Icons';

interface ThemeToggleProps {
  theme: 'dark' | 'light';
  onToggle: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border-2 hover:scale-110"
      style={{
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        borderColor: theme === 'dark' ? '#ec4899' : '#ec4899',
        color: theme === 'dark' ? '#ec4899' : '#ec4899'
      }}
    >
      <Icon name={theme === 'dark' ? 'moon' : 'flame'} className="w-4 h-4" />
    </button>
  );
};

export default ThemeToggle;
