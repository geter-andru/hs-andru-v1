import React from 'react';

const LoadingSpinner = ({ 
  size = 'medium', 
  message = 'Loading...', 
  fullScreen = false,
  className = '' 
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  const containerClass = fullScreen 
    ? 'fixed inset-0 flex items-center justify-center bg-primary z-50'
    : 'flex items-center justify-center p-8';

  return (
    <div className={`${containerClass} ${className}`}>
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className={`${sizeClasses[size]} animate-spin text-brand`}>
            <svg className="w-full h-full" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        </div>
        {message && (
          <p className="text-sm text-secondary animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

// Skeleton loading component for content areas
export const ContentSkeleton = () => (
  <div className="animate-pulse">
    <div className="space-y-4">
      <div className="h-4 bg-surface rounded w-3/4"></div>
      <div className="h-4 bg-surface rounded w-1/2"></div>
      <div className="h-4 bg-surface rounded w-2/3"></div>
      <div className="space-y-2">
        <div className="h-3 bg-surface rounded"></div>
        <div className="h-3 bg-surface rounded w-5/6"></div>
        <div className="h-3 bg-surface rounded w-4/6"></div>
      </div>
    </div>
  </div>
);

// Card skeleton for tool sections
export const CardSkeleton = () => (
  <div className="card card-padding glass animate-pulse-subtle">
    <div className="flex items-center space-x-4 mb-4">
      <div className="rounded-full bg-surface h-10 w-10"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-surface rounded w-3/4"></div>
        <div className="h-3 bg-surface rounded w-1/2"></div>
      </div>
    </div>
    <div className="space-y-3">
      <div className="h-3 bg-surface rounded"></div>
      <div className="h-3 bg-surface rounded w-5/6"></div>
      <div className="h-3 bg-surface rounded w-4/6"></div>
    </div>
  </div>
);

export default LoadingSpinner;