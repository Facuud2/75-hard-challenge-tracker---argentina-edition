import React, { useState, useMemo } from 'react';
import type { CalendarDay } from '../../types/moduleC';
import { getArgentinaDateString } from '../../utils/time';
import { Icon } from '../Icons';

interface CalendarioInteligenteProps {
  theme: 'dark' | 'light';
  challengeHistory: Array<{ dateString: string; tasks: Array<{ completed: boolean }> }>;
  onDateSelect: (date: string) => void;
  selectedDate: string | null;
  challengeStartDate?: string;
}

const CalendarioInteligente: React.FC<CalendarioInteligenteProps> = ({
  theme,
  challengeHistory,
  onDateSelect,
  selectedDate,
  challengeStartDate
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = getArgentinaDateString();

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayData = challengeHistory.find(h => h.dateString === dateStr);
      const isToday = dateStr === today;
      const isFuture = dateStr > today;

      let status: CalendarDay['status'] = 'future';
      if (!isFuture) {
        if (dayData) {
          const allCompleted = dayData.tasks.every(t => t.completed);
          status = allCompleted ? 'completed' : 'failed';
        } else if (challengeStartDate && dateStr < challengeStartDate) {
          status = 'future';
        } else if (dateStr < today) {
          status = 'failed';
        } else {
          status = 'pending';
        }
      }

      days.push({
        date: dateStr,
        status,
        tasksCompleted: dayData?.tasks.filter(t => t.completed).length || 0,
        totalTasks: dayData?.tasks.length || 0,
        hasPhoto: false
      });
    }

    return days;
  }, [currentMonth, challengeHistory, today, challengeStartDate]);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const getDayColor = (day: CalendarDay) => {
    switch (day.status) {
      case 'completed':
        // Use green tones for completed to match progress indicators elsewhere
        return theme === 'dark'
          ? 'bg-gradient-to-br from-emerald-700/80 to-emerald-900/80 border-emerald-500/40 shadow-emerald-500/20'
          : 'bg-gradient-to-br from-emerald-100/80 to-emerald-50/80 border-emerald-500/40 shadow-emerald-500/10';
      case 'failed':
        // Use red tones for failed days
        return theme === 'dark'
          ? 'bg-gradient-to-br from-red-700/60 to-red-900/60 border-red-600/40 shadow-red-600/20'
          : 'bg-gradient-to-br from-red-200/80 to-red-100/80 border-red-600/40 shadow-red-600/10';
      case 'pending':
        return theme === 'dark'
          ? 'bg-gradient-to-br from-pink-950/40 to-pink-900/40 border-pink-700/30'
          : 'bg-gradient-to-br from-pink-50/60 to-pink-100/60 border-pink-400/30';
      case 'future':
        return theme === 'dark'
          ? 'bg-gradient-to-br from-pink-950/20 to-black/40 border-pink-800/20'
          : 'bg-gradient-to-br from-pink-50/40 to-white/40 border-pink-300/20';
      default:
        return theme === 'dark'
          ? 'bg-gradient-to-br from-pink-950/40 to-pink-900/40 border-pink-700/30'
          : 'bg-gradient-to-br from-pink-50/60 to-pink-100/60 border-pink-400/30';
    }
  };

  const getDayTextColor = (day: CalendarDay) => {
    switch (day.status) {
      case 'completed':
        return theme === 'dark' ? 'text-emerald-200' : 'text-emerald-800';
      case 'failed':
        return theme === 'dark' ? 'text-red-300' : 'text-red-700';
      case 'pending':
        return theme === 'dark' ? 'text-pink-300' : 'text-pink-600';
      case 'future':
        return theme === 'dark' ? 'text-pink-500' : 'text-pink-400';
      default:
        return theme === 'dark' ? 'text-pink-300' : 'text-pink-600';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newMonth;
    });
  };

  return (
    <div className={`rounded-3xl p-6 border relative overflow-hidden group backdrop-blur-sm transition-all duration-300 ${theme === 'dark'
      ? 'bg-gradient-to-br from-pink-950/50 to-black/50 border-pink-500/20'
      : 'bg-gradient-to-br from-pink-50 to-white border-pink-200'
      }`}>
      {/* Subtle background glow */}
      <div className={`absolute -top-20 -right-20 w-64 h-64 blur-[80px] rounded-full pointer-events-none transition-opacity duration-300 ${theme === 'dark'
        ? 'bg-gradient-to-br from-pink-400/20 to-pink-600/10'
        : 'bg-gradient-to-br from-pink-200/15 to-pink-300/10'
        }`} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth('prev')}
            className={`p-3 rounded-xl transition-all duration-300 ${theme === 'dark'
              ? 'hover:bg-pink-950/50 text-pink-300 hover:text-pink-200 hover:border-pink-400/30 border border-pink-500/20'
              : 'hover:bg-pink-100 text-pink-600 hover:text-pink-500 border border-pink-200'
              }`}
          >
            <Icon name="chevronLeft" className="w-5 h-5" />
          </button>

          <h3 className={`text-xl font-bold transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>

          <button
            onClick={() => navigateMonth('next')}
            className={`p-3 rounded-xl transition-all duration-300 ${theme === 'dark'
              ? 'hover:bg-pink-950/50 text-pink-300 hover:text-pink-200 hover:border-pink-400/30 border border-pink-500/20'
              : 'hover:bg-pink-100 text-pink-600 hover:text-pink-500 border border-pink-200'
              }`}
          >
            <Icon name="chevronRight" className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-3">
          {weekDays.map(day => (
            <div
              key={day}
              className={`text-center text-sm font-bold uppercase tracking-wider transition-colors duration-300 ${theme === 'dark' ? 'text-pink-400' : 'text-pink-600'
                }`}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            const isCurrentMonth = day.date.startsWith(`${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`);
            const isSelected = selectedDate === day.date;
            const isToday = day.date === today;

            return (
              <button
                key={index}
                onClick={() => onDateSelect(day.date)}
                disabled={day.status === 'future'}
                className={`
                  relative p-3 h-12 rounded-xl border transition-all duration-300 text-sm font-medium
                  ${getDayColor(day)}
                  ${getDayTextColor(day)}
                  ${!isCurrentMonth ? 'opacity-40' : ''}
                  ${isSelected ? 'ring-2 ring-pink-500 ring-offset-2 ring-offset-transparent scale-105 shadow-lg' : ''}
                  ${day.status !== 'future' ? 'hover:scale-105 hover:shadow-lg cursor-pointer' : 'cursor-not-allowed'}
                  ${isToday ? 'font-bold ring-1 ring-pink-500/50' : ''}
                `}
              >
                <span className="text-sm">
                  {new Date(day.date).getDate()}
                </span>

                {/* Progress indicator */}
                {day.status !== 'future' && day.totalTasks > 0 && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${day.status === 'completed'
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/50'
                      : day.status === 'failed'
                        ? 'bg-gradient-to-br from-red-400 to-red-500 shadow-red-400/50'
                        : 'bg-gradient-to-br from-pink-400 to-pink-500 shadow-pink-400/50'
                      }`} />
                  </div>
                )}

                {/* Photo indicator */}
                {day.hasPhoto && (
                  <div className="absolute top-1 right-1">
                    <Icon name="camera" className="w-3.5 h-3.5 text-pink-500 drop-shadow-sm" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full border shadow-sm ${theme === 'dark'
              ? 'bg-gradient-to-br from-emerald-700/80 to-emerald-900/80 border-emerald-500/40 shadow-emerald-500/20'
              : 'bg-gradient-to-br from-emerald-100/80 to-emerald-50/80 border-emerald-500/40 shadow-emerald-500/10'
              }`} />
            <span className={`font-medium transition-colors duration-300 ${theme === 'dark' ? 'text-emerald-300' : 'text-emerald-600'
              }`}>Completado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full border shadow-sm ${theme === 'dark'
              ? 'bg-gradient-to-br from-red-700/60 to-red-900/60 border-red-600/40 shadow-red-600/20'
              : 'bg-gradient-to-br from-red-200/80 to-red-100/80 border-red-600/40 shadow-red-600/10'
              }`} />
            <span className={`font-medium transition-colors duration-300 ${theme === 'dark' ? 'text-red-300' : 'text-red-600'
              }`}>Fallido</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full border shadow-sm ${theme === 'dark'
              ? 'bg-gradient-to-br from-pink-950/40 to-pink-900/40 border-pink-700/30'
              : 'bg-gradient-to-br from-pink-50/60 to-pink-100/60 border-pink-400/30'
              }`} />
            <span className={`font-medium transition-colors duration-300 ${theme === 'dark' ? 'text-pink-300' : 'text-pink-600'
              }`}>Pendiente</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarioInteligente;