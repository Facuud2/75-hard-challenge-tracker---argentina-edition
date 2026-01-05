
import React, { useState, useEffect } from 'react';
import { getTimeUntilMidnightART } from '../utils/time';

interface TimerProps {
  theme?: 'dark' | 'light';
}

const Timer: React.FC<TimerProps> = ({ theme = 'dark' }) => {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilMidnightART());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntilMidnightART());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`flex items-center gap-2 transition-colors duration-300 ${
      theme === 'dark' ? 'text-pink-300' : 'text-pink-500'
    }`}>
      <div className="flex gap-0.5">
         <span className={`text-xs font-mono py-1 px-1.5 rounded border transition-colors duration-300 ${
           theme === 'dark'
             ? 'bg-pink-950/50 text-pink-300 border-pink-500/20'
             : 'bg-pink-100 text-pink-600 border-pink-200'
         }`}>{String(timeLeft.hours).padStart(2, '0')}</span>
         <span className={`py-1 transition-colors duration-300 ${
           theme === 'dark' ? 'text-pink-400' : 'text-pink-500'
         }`}>:</span>
         <span className={`text-xs font-mono py-1 px-1.5 rounded border transition-colors duration-300 ${
           theme === 'dark'
             ? 'bg-pink-950/50 text-pink-300 border-pink-500/20'
             : 'bg-pink-100 text-pink-600 border-pink-200'
         }`}>{String(timeLeft.minutes).padStart(2, '0')}</span>
         <span className={`py-1 transition-colors duration-300 ${
           theme === 'dark' ? 'text-pink-400' : 'text-pink-500'
         }`}>:</span>
         <span className={`text-xs font-mono py-1 px-1.5 rounded border transition-colors duration-300 ${
           theme === 'dark'
             ? 'bg-pink-950/50 text-pink-300 border-pink-500/20'
             : 'bg-pink-100 text-pink-600 border-pink-200'
         }`}>{String(timeLeft.seconds).padStart(2, '0')}</span>
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${
        theme === 'dark' ? 'text-pink-400' : 'text-pink-500'
      }`}>hasta reset (ART)</span>
    </div>
  );
};

export default Timer;
