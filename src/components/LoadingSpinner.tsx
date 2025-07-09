// components/LoadingSpinner.tsx
import React from 'react';

type LoadingSpinnerProps = {
  size?: number;
  className?: string;
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 64, className = '' }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className="animate-spin rounded-full border-t-4 border-b-4 border-blue-500"
        style={{ width: size, height: size }}
      ></div>
      <p className="ml-4 text-lg text-gray-700">Loading...</p>
    </div>
  );
};

export default LoadingSpinner;
