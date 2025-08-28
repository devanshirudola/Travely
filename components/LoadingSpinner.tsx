
import React from 'react';

const LoadingSpinner: React.FC<{ message?: string }> = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-12 h-12 border-4 border-t-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
