/**
 * Mobile Optimized Components - Touch-friendly UI elements
 * 
 * Provides mobile-optimized components with proper touch targets and interactions.
 */

import React from 'react';

// Mobile-optimized button with proper touch targets
const MobileOptimizedButton = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  className = '',
  ...props 
}) => {
  const baseClasses = 'min-h-[44px] min-w-[44px] touch-manipulation flex items-center justify-center font-medium rounded-lg transition-colors duration-200';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white',
    outline: 'border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white'
  };
  
  const sizes = {
    small: 'py-2 px-3 text-sm',
    medium: 'py-3 px-4 text-base',
    large: 'py-4 px-6 text-lg'
  };

  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Horizontal scroll for mobile tabs
const MobileTabNavigation = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="lg:hidden overflow-x-auto scrollbar-hide">
      <div className="flex space-x-2 px-4 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`min-w-[120px] py-2 px-4 rounded-lg whitespace-nowrap text-sm font-medium transition-colors duration-200 ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// Mobile-optimized tab button
const TabButton = ({ active, onClick, children, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 touch-manipulation ${
        active 
          ? 'border-blue-500 text-blue-400' 
          : 'border-transparent text-gray-400 hover:text-gray-300'
      } ${className}`}
    >
      {children}
    </button>
  );
};

// Mobile-optimized input field
const MobileOptimizedInput = ({
  label,
  value,
  onChange,
  prefix,
  suffix,
  type = 'text',
  className = '',
  ...props
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full min-h-[44px] px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation ${
            prefix ? 'pl-8' : ''
          } ${suffix ? 'pr-16' : ''}`}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
};

// Mobile-optimized card component
const MobileOptimizedCard = ({ 
  children, 
  className = '',
  hover = false,
  onClick,
  ...props 
}) => {
  const baseClasses = 'bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6';
  const hoverClasses = hover ? 'hover:border-blue-500 cursor-pointer transition-colors duration-200 touch-manipulation' : '';
  
  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export {
  MobileOptimizedButton,
  MobileTabNavigation,
  TabButton,
  MobileOptimizedInput,
  MobileOptimizedCard
};