import React from 'react';
import { authService } from '../../services/authService';

const Header = () => {
  const session = authService.getCurrentSession();
  
  if (!session) return null;

  return (
    <header className="bg-primary border-b border-glass-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-10 w-10 bg-brand rounded-lg flex items-center justify-center shadow-elegant">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-primary">
                  Business Assets
                </h1>
                <p className="text-sm text-muted">
                  Revenue Assessment Platform
                </p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="text-base font-medium text-primary">
                {session.customerName}
              </div>
              <div className="text-sm text-muted">
                Customer ID: {session.customerId}
              </div>
            </div>
            
            {/* User Avatar */}
            <div className="h-12 w-12 bg-surface rounded-full flex items-center justify-center shadow-elegant border border-glass-border">
              <span className="text-lg font-semibold text-brand">
                {session.customerName?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;