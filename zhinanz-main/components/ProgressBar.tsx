
import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const percentage = Math.min((current / total) * 100, 100);
  
  return (
    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
      <div 
        className="bg-indigo-500 h-full transition-all duration-700 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
