
import React, { useState, useEffect } from 'react';
import { getTimeUntilMidnightART } from '../utils/time';

const Timer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilMidnightART());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntilMidnightART());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 text-zinc-500">
      <div className="flex gap-0.5">
         <span className="bg-zinc-800 text-white text-xs font-mono py-1 px-1.5 rounded">{String(timeLeft.hours).padStart(2, '0')}</span>
         <span className="py-1">:</span>
         <span className="bg-zinc-800 text-white text-xs font-mono py-1 px-1.5 rounded">{String(timeLeft.minutes).padStart(2, '0')}</span>
         <span className="py-1">:</span>
         <span className="bg-zinc-800 text-white text-xs font-mono py-1 px-1.5 rounded">{String(timeLeft.seconds).padStart(2, '0')}</span>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider">hasta reset (ART)</span>
    </div>
  );
};

export default Timer;
