import React from 'react';
import { NavLink, useLocation, useParams } from 'react-router-dom';
import { authService } from '../../services/authService';

const Navigation = () => {
  const location = useLocation();
  const params = useParams();
  
  // Get access token from session or URL
  const session = authService.getCurrentSession();
  const searchParams = new URLSearchParams(location.search);
  const accessToken = session?.accessToken || searchParams.get('token');
  const customerId = params.customerId;
  
  // Build query string to preserve access token
  const queryString = accessToken ? `?token=${accessToken}` : '';
  
  // If no customerId, don't render navigation
  if (!customerId) {
    console.error('Navigation - No customerId available');
    return null;
  }
  
  const navItems = [
    {
      id: 'icp',
      name: 'ICP Analysis',
      path: `/customer/${customerId}/dashboard/icp${queryString}`,
      step: 1,
      description: 'Identify & rate ideal customers'
    },
    {
      id: 'cost-calculator',
      name: 'Cost Calculator',
      path: `/customer/${customerId}/dashboard/cost-calculator${queryString}`,
      step: 2,
      description: 'Calculate cost of inaction'
    },
    {
      id: 'business-case',
      name: 'Business Case',
      path: `/customer/${customerId}/dashboard/business-case${queryString}`,
      step: 3,
      description: 'Build pilot-to-contract cases'
    },
    {
      id: 'results',
      name: 'Results Dashboard',
      path: `/customer/${customerId}/dashboard/results${queryString}`,
      step: 4,
      description: 'Executive results & insights'
    }
  ];
  
  console.log('Navigation - Building paths with customerId:', customerId, 'accessToken:', accessToken ? 'found' : 'missing', 'queryString:', queryString);
  console.log('Navigation - Session data:', session ? 'exists' : 'missing');

  return (
    <nav className="bg-primary py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center space-x-8 lg:space-x-16">
          {navItems.map((item, index) => (
            <div key={item.id} className="flex items-center">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center group transition-all duration-300 ${
                    isActive ? 'opacity-100' : 'opacity-60 hover:opacity-80'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Step Circle */}
                    <div className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                      isActive 
                        ? 'bg-brand border-brand shadow-lg shadow-brand/30' 
                        : 'bg-surface border-glass-border hover:border-brand/50'
                    }`}>
                      <span className={`text-lg font-semibold ${
                        isActive ? 'text-white' : 'text-secondary'
                      }`}>
                        {item.step}
                      </span>
                    </div>
                    
                    {/* Step Label */}
                    <div className="mt-3 text-center">
                      <div className={`text-sm font-medium ${
                        isActive ? 'text-primary' : 'text-secondary'
                      }`}>
                        {item.name}
                      </div>
                      <div className="text-xs text-muted mt-1 max-w-24">
                        {item.description}
                      </div>
                    </div>
                  </>
                )}
              </NavLink>
              
              {/* Connection Line */}
              {index < navItems.length - 1 && (
                <div className="hidden lg:flex ml-8 xl:ml-16">
                  <div className="w-16 xl:w-24 h-0.5 bg-surface"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;