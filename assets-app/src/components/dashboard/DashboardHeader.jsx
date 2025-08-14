import React from 'react';
import { User } from 'lucide-react';

const DashboardHeader = ({ customerName, companyName, competencyLevel, isAdmin = false }) => {
  return (
    <header className="flex justify-between items-center p-6 bg-gray-900 border-b border-gray-700">
      <div className="flex items-center space-x-4">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-800 rounded-full border border-gray-600">
          <User size={20} className="text-gray-400" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Professional Development Dashboard
          </h1>
          <p className="text-gray-400">
            {customerName} from {companyName}
          </p>
        </div>
      </div>
      
      <div className="text-right">
        <div className="flex items-center space-x-3">
          {isAdmin && (
            <div className="px-3 py-1 bg-blue-900 border border-blue-700 rounded-full">
              <span className="text-xs font-medium text-blue-300">Demo Mode</span>
            </div>
          )}
          <div>
            <div className="text-lg font-medium text-blue-400">
              Level: {competencyLevel}
            </div>
            <div className="text-sm text-gray-500">
              Revenue Intelligence Development
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;