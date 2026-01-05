
import React from 'react';
import { Task } from '../types';
import { Icon } from './Icons';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle }) => {
  return (
    <button 
      onClick={() => onToggle(task.id)}
      className={`max-w-full w-full flex items-center gap-3 p-3 sm:gap-4 sm:p-4 rounded-2xl text-left transition-all duration-200 active:scale-[0.98] group ${
        task.completed 
        ? 'bg-pink-950/30 opacity-60 border border-pink-500/10' 
        : 'bg-pink-950/20 hover:bg-pink-950/40 border border-pink-500/20'
      }`}
    >
      {/* Icon Container */}
      <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${
        task.completed ? 'bg-pink-900/50 text-pink-600' : 'bg-pink-900/30 text-pink-400 group-hover:bg-pink-900/50'
      }`}>
        <Icon name={task.icon} className="w-5 h-5" />
      </div>
      
      {/* Text Content */}
      <div className="flex-1 min-w-0">
        <h3 className={`text-base font-bold leading-tight transition-colors break-words ${
          task.completed ? 'text-pink-600 line-through' : 'text-white'
        }`}>
          {task.label}
        </h3>
        <p className={`text-xs mt-0.5 truncate transition-colors ${
          task.completed ? 'text-pink-700' : 'text-pink-300'
        }`}>
          {task.description}
        </p>
      </div>

      {/* Checkbox UI */}
      <div className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
        task.completed 
        ? 'bg-pink-600 border-pink-600' 
        : 'border-pink-500/50 group-hover:border-pink-400 bg-transparent'
      }`}>
        {task.completed && (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
    </button>
  );
};

export default TaskItem;
