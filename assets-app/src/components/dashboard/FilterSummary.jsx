import React from 'react';
import { Filter, X, AlertCircle } from 'lucide-react';

const FilterSummary = ({ 
  activeFilters, 
  onClearAll, 
  resultCount,
  totalCount,
  className = '' 
}) => {
  // Calculate number of active filters
  const getActiveFiltersCount = () => {
    return Object.entries(activeFilters).filter(([key, value]) => {
      return value && value !== 'all' && value !== '';
    }).length;
  };
  
  // Get list of active filter labels
  const getActiveFilterLabels = () => {
    const labels = [];
    
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        // Format the filter key to be more readable
        const formattedKey = key.replace(/Filter$/, '').replace(/([A-Z])/g, ' $1').trim();
        const capitalizedKey = formattedKey.charAt(0).toUpperCase() + formattedKey.slice(1);
        
        // Map values to readable labels
        const valueLabels = {
          week: 'This Week',
          month: 'This Month',
          quarter: 'This Quarter',
          customerAnalysis: 'Customer Analysis',
          valueCommunication: 'Value Communication',
          salesExecution: 'Sales Execution',
          ICP_ANALYSIS: 'ICP Analysis',
          COST_MODEL: 'Cost Modeling',
          BUSINESS_CASE: 'Business Cases',
          REAL_ACTION: 'Real Actions'
        };
        
        const displayValue = valueLabels[value] || value;
        labels.push({ key: capitalizedKey, value: displayValue });
      }
    });
    
    return labels;
  };
  
  const activeCount = getActiveFiltersCount();
  const activeLabels = getActiveFilterLabels();
  const percentageShown = totalCount > 0 ? Math.round((resultCount / totalCount) * 100) : 100;
  
  // No filters applied state
  if (activeCount === 0) {
    return (
      <div className={`flex items-center space-x-2 px-4 py-2 text-gray-400 ${className}`}>
        <Filter size={16} />
        <span className="text-sm">No filters applied</span>
        {totalCount > 0 && (
          <span className="text-sm text-gray-500">
            • Showing all {totalCount} results
          </span>
        )}
      </div>
    );
  }
  
  // Active filters state
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {/* Filter Count Badge */}
      <div className="flex items-center space-x-2 px-4 py-2 bg-blue-900 bg-opacity-30 border border-blue-700/50 rounded-lg">
        <Filter size={16} className="text-blue-400" />
        <div className="text-sm">
          <span className="text-blue-400 font-medium">
            {activeCount} filter{activeCount > 1 ? 's' : ''} active
          </span>
        </div>
      </div>
      
      {/* Result Count */}
      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-700/50 rounded-lg">
        <div className="text-sm">
          <span className="text-white font-medium">{resultCount}</span>
          <span className="text-gray-400"> of </span>
          <span className="text-gray-300">{totalCount}</span>
          <span className="text-gray-400"> results</span>
        </div>
        {percentageShown < 100 && (
          <div className="text-xs text-gray-500">
            ({percentageShown}%)
          </div>
        )}
      </div>
      
      {/* Active Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {activeLabels.map((filter, index) => (
          <div 
            key={index}
            className="inline-flex items-center px-3 py-1 bg-gray-700 rounded-full text-xs"
          >
            <span className="text-gray-400">{filter.key}:</span>
            <span className="ml-1 text-white font-medium">{filter.value}</span>
          </div>
        ))}
      </div>
      
      {/* Clear All Button */}
      <button
        onClick={onClearAll}
        className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-all duration-200"
        aria-label="Clear all filters"
      >
        <X size={14} />
        <span>Clear All</span>
      </button>
      
      {/* Low Results Warning */}
      {resultCount > 0 && resultCount < 3 && (
        <div className="flex items-center space-x-1 text-xs text-amber-400">
          <AlertCircle size={14} />
          <span>Limited results - consider adjusting filters</span>
        </div>
      )}
      
      {/* No Results Warning */}
      {resultCount === 0 && (
        <div className="flex items-center space-x-1 text-xs text-red-400">
          <AlertCircle size={14} />
          <span>No results found - try different filters</span>
        </div>
      )}
    </div>
  );
};

export default FilterSummary;