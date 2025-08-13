/**
 * DemoContentBadge Component
 * 
 * Subtle badge to indicate demo content in admin mode
 */

import React from 'react';

const DemoContentBadge = ({ show = false, size = 'sm', className = '' }) => {
  if (!show) return null;

  const sizeClasses = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1.5',
    lg: 'text-sm px-3 py-2'
  };

  return (
    <div className={`inline-flex items-center bg-blue-900/50 border border-blue-500/30 rounded text-blue-300 ${sizeClasses[size]} ${className}`}>
      <span className="mr-1" role="img" aria-label="demo">📊</span>
      <span>Demo Content</span>
    </div>
  );
};

export default DemoContentBadge;