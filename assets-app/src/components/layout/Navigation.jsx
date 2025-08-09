import React from 'react';
import { NavLink, useLocation, useParams } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();
  const params = useParams();
  
  // Extract access token from current URL to preserve it in navigation
  const searchParams = new URLSearchParams(location.search);
  const accessToken = searchParams.get('token');
  const customerId = params.customerId;
  
  // Build query string to preserve access token
  const queryString = accessToken ? `?token=${accessToken}` : '';
  
  const navItems = [
    {
      id: 'icp',
      name: 'ICP Analysis',
      path: `dashboard/icp${queryString}`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      description: 'Identify & rate ideal customers'
    },
    {
      id: 'cost-calculator',
      name: 'Cost Calculator',
      path: `dashboard/cost-calculator${queryString}`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      description: 'Calculate cost of inaction'
    },
    {
      id: 'business-case',
      name: 'Business Case',
      path: `dashboard/business-case${queryString}`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      description: 'Build pilot-to-contract cases'
    }
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`
              }
            >
              <span className="mr-2">{item.icon}</span>
              <div className="flex flex-col items-start">
                <span>{item.name}</span>
                <span className="text-xs opacity-75">{item.description}</span>
              </div>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;