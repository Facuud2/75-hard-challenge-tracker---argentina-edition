
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
        ? 'bg-[#1C1C1E] opacity-60' 
        : 'bg-[#1C1C1E] hover:bg-[#2C2C2E]'
      }`}
    >
      {/* Icon Container */}
      <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${
        task.completed ? 'bg-zinc-800 text-zinc-500' : 'bg-[#2C2C2E] text-white group-hover:bg-[#3A3A3C]'
      }`}>
        <Icon name={task.icon} className="w-5 h-5" />
      </div>
      
      {/* Text Content */}
      <div className="flex-1 min-w-0">
        <h3 className={`text-base font-bold leading-tight transition-colors break-words ${
          task.completed ? 'text-zinc-500 line-through' : 'text-white'
        }`}>
          {task.label}
        </h3>
        <p className={`text-xs mt-0.5 truncate transition-colors ${
          task.completed ? 'text-zinc-600' : 'text-zinc-400'
        }`}>
          {task.description}
        </p>
      </div>

      {/* Checkbox UI */}
      <div className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
        task.completed 
        ? 'bg-green-600 border-green-600' 
        : 'border-zinc-600 group-hover:border-zinc-400 bg-transparent'
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
