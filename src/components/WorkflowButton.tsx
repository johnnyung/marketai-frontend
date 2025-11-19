// frontend/src/components/WorkflowButton.tsx
import React from 'react';

interface WorkflowButtonProps {
  stepNumber?: number;
  title: string;
  description: string;
  timeEstimate: string;
  icon: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  disabledReason?: string;
  prerequisite?: string;
  color?: 'blue' | 'purple' | 'green' | 'orange';
}

const WorkflowButton: React.FC<WorkflowButtonProps> = ({
  stepNumber,
  title,
  description,
  timeEstimate,
  icon,
  onClick,
  disabled = false,
  loading = false,
  disabledReason,
  prerequisite,
  color = 'blue'
}) => {
  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700 border-blue-300',
    purple: 'bg-purple-600 hover:bg-purple-700 border-purple-300',
    green: 'bg-green-600 hover:bg-green-700 border-green-300',
    orange: 'bg-orange-600 hover:bg-orange-700 border-orange-300'
  };

  const badgeColorClasses = {
    blue: 'bg-blue-600',
    purple: 'bg-purple-600',
    green: 'bg-green-600',
    orange: 'bg-orange-600'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        relative px-6 py-4 rounded-lg border-2 text-white font-semibold
        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        ${disabled ? 'bg-gray-400' : colorClasses[color]}
        ${loading ? 'animate-pulse' : ''}
        min-w-[300px] text-left
      `}
    >
      {stepNumber && (
        <div className={`
          absolute -top-3 -right-3 ${badgeColorClasses[color]} 
          text-white rounded-full w-8 h-8 flex items-center justify-center 
          text-sm font-bold border-2 border-white shadow-lg
        `}>
          {stepNumber}
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="text-2xl mt-1">{icon}</div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="font-bold text-lg">{title}</div>
            {loading && (
              <div className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                Processing...
              </div>
            )}
          </div>

          <div className="text-sm opacity-90 mb-2">{description}</div>

          <div className="text-xs opacity-75">
            ⏱️ Time: {timeEstimate}
          </div>

          {prerequisite && !disabled && (
            <div className="text-xs mt-2 bg-white bg-opacity-20 px-2 py-1 rounded inline-block">
              ℹ️ After: {prerequisite}
            </div>
          )}

          {disabled && disabledReason && (
            <div className="text-xs mt-2 bg-red-500 bg-opacity-80 px-2 py-1 rounded inline-block">
              ⚠️ {disabledReason}
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

export default WorkflowButton;
