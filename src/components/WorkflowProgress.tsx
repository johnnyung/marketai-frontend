// frontend/src/components/WorkflowProgress.tsx
import React from 'react';

interface WorkflowStep {
  number: number;
  name: string;
  completed: boolean;
  current: boolean;
}

interface WorkflowProgressProps {
  steps: WorkflowStep[];
}

const WorkflowProgress: React.FC<WorkflowProgressProps> = ({ steps }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        📋 Daily Workflow Progress
      </h3>

      <div className="flex items-center gap-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  font-bold text-lg border-2 transition-all duration-300
                  ${step.completed ? 'bg-green-500 text-white border-green-600' : ''}
                  ${step.current ? 'bg-blue-500 text-white border-blue-600 ring-4 ring-blue-200' : ''}
                  ${!step.completed && !step.current ? 'bg-gray-200 text-gray-500 border-gray-300' : ''}
                `}
              >
                {step.completed ? '✓' : step.number}
              </div>
              <div className={`
                text-xs mt-2 font-medium text-center
                ${step.current ? 'text-blue-600 font-bold' : 'text-gray-600'}
              `}>
                {step.name}
              </div>
            </div>

            {index < steps.length - 1 && (
              <div className={`
                flex-1 h-1 rounded transition-all duration-300
                ${step.completed ? 'bg-green-500' : 'bg-gray-200'}
              `} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        {steps.every(s => s.completed) && (
          <div className="text-green-600 font-semibold">
            ✅ All steps complete! Your system is up to date.
          </div>
        )}
        {steps.some(s => s.current) && (
          <div className="text-blue-600 font-semibold">
            ⏳ {steps.find(s => s.current)?.name} in progress...
          </div>
        )}
        {!steps.some(s => s.completed || s.current) && (
          <div className="text-orange-600 font-semibold">
            ⚡ Start by fetching fresh data (Step 1)
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowProgress;
