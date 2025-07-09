
import React from 'react';

type GenerationStep = 'input' | 'css' | 'generate' | 'complete';

interface ProgressIndicatorProps {
  currentStep: GenerationStep;
}

export function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  const steps = ['input', 'css', 'generate', 'complete'] as const;
  
  return (
    <div className="flex items-center justify-center space-x-4 mb-6">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep === step ? 'bg-blue-600 text-white' : 
            steps.indexOf(currentStep) > index ? 'bg-green-600 text-white' : 
            'bg-gray-200 text-gray-600'
          }`}>
            {index + 1}
          </div>
          {index < 3 && (
            <div className={`w-12 h-0.5 mx-2 ${
              steps.indexOf(currentStep) > index ? 'bg-green-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}
