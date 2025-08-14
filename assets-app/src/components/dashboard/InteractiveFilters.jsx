import React from 'react';
import FilterDropdown from './FilterDropdown';
import FilterSummary from './FilterSummary';

const InteractiveFilters = ({
  filters,
  onFilterChange,
  onClearAll,
  filteredResults,
  totalResults,
  className = ''
}) => {
  // Time period filter options
  const timeOptions = [
    { value: 'all', label: 'All Time', description: 'Complete history' },
    { value: 'week', label: 'This Week', description: 'Last 7 days' },
    { value: 'month', label: 'This Month', description: 'Last 30 days' },
    { value: 'quarter', label: 'This Quarter', description: 'Last 90 days' }
  ];
  
  // Competency focus filter options
  const competencyOptions = [
    { value: 'all', label: 'All Areas', description: 'All competencies' },
    { value: 'customerAnalysis', label: 'Customer Analysis', description: 'ICP & buyer psychology' },
    { value: 'valueCommunication', label: 'Value Communication', description: 'ROI & cost modeling' },
    { value: 'salesExecution', label: 'Sales Execution', description: 'Deal closure & proposals' }
  ];
  
  // Activity type filter options
  const activityOptions = [
    { value: 'all', label: 'All Activities', description: 'Every activity type' },
    { value: 'ICP_ANALYSIS', label: 'ICP Analysis', description: 'Customer profiling' },
    { value: 'COST_MODEL', label: 'Cost Modeling', description: 'Financial impact' },
    { value: 'BUSINESS_CASE', label: 'Business Cases', description: 'Executive proposals' },
    { value: 'REAL_ACTION', label: 'Real Actions', description: 'Professional activities' },
    { value: 'COMPETENCY_IMPROVEMENT', label: 'Development', description: 'Skill building' }
  ];
  
  // Impact level filter options
  const impactOptions = [
    { value: 'all', label: 'All Impacts', description: 'Any impact level' },
    { value: 'critical', label: 'Critical Impact', description: 'Highest priority' },
    { value: 'high', label: 'High Impact', description: 'Significant value' },
    { value: 'medium', label: 'Medium Impact', description: 'Standard priority' },
    { value: 'low', label: 'Low Impact', description: 'Minor activities' }
  ];

  return (
    <div className={`bg-gray-800 border-b border-gray-700 ${className}`}>
      {/* Filter Controls Container */}
      <div className="p-6">
        {/* Filter Dropdowns Grid */}
        <div className="flex flex-wrap gap-4 mb-4">
          {/* Time Period Filter */}
          <FilterDropdown
            label="Time Period"
            options={timeOptions}
            value={filters.timeFilter || 'week'}
            onChange={(value) => onFilterChange('timeFilter', value)}
            icon="calendar"
            className="flex-1 min-w-[200px] md:min-w-0 md:flex-initial"
          />
          
          {/* Competency Focus Filter */}
          <FilterDropdown
            label="Competency Focus"
            options={competencyOptions}
            value={filters.competencyFilter || 'all'}
            onChange={(value) => onFilterChange('competencyFilter', value)}
            icon="target"
            className="flex-1 min-w-[200px] md:min-w-0 md:flex-initial"
          />
          
          {/* Activity Type Filter */}
          <FilterDropdown
            label="Activity Type"
            options={activityOptions}
            value={filters.activityFilter || 'all'}
            onChange={(value) => onFilterChange('activityFilter', value)}
            icon="activity"
            className="flex-1 min-w-[200px] md:min-w-0 md:flex-initial"
          />
          
          {/* Impact Level Filter */}
          <FilterDropdown
            label="Impact Level"
            options={impactOptions}
            value={filters.impactFilter || 'all'}
            onChange={(value) => onFilterChange('impactFilter', value)}
            icon="filter"
            className="flex-1 min-w-[200px] md:min-w-0 md:flex-initial"
          />
        </div>
        
        {/* Filter Summary Bar */}
        <FilterSummary
          activeFilters={filters}
          onClearAll={onClearAll}
          resultCount={filteredResults?.length || 0}
          totalCount={totalResults || 0}
          className="mt-4"
        />
      </div>
      
      {/* Professional Gradient Border */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
    </div>
  );
};

export default InteractiveFilters;