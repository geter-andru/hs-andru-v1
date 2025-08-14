import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Target, Activity, ChevronDown, ChevronUp, Filter } from 'lucide-react';

// Icon mapping for filter types
const FILTER_ICONS = {
  calendar: Calendar,
  target: Target,
  activity: Activity,
  filter: Filter
};

const FilterDropdown = ({ 
  label, 
  options, 
  value, 
  onChange, 
  icon = 'filter',
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Get the selected option
  const selectedOption = options.find(opt => opt.value === value) || options[0];
  
  // Get the appropriate icon component
  const IconComponent = FILTER_ICONS[icon] || FILTER_ICONS.filter;
  const ChevronIcon = isOpen ? ChevronUp : ChevronDown;
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);
  
  // Handle option selection
  const handleOptionSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Dropdown Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`
          flex items-center space-x-3 px-4 py-2.5 min-h-[44px]
          bg-gray-700 hover:bg-gray-600 
          text-white rounded-lg 
          transition-all duration-200
          border border-gray-600 hover:border-gray-500
          ${isOpen ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
        `}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Filter by ${label}`}
      >
        {/* Icon */}
        <IconComponent 
          size={16} 
          className="text-gray-400 flex-shrink-0" 
        />
        
        {/* Label and Value */}
        <div className="text-left min-w-0 flex-1">
          <div className="text-xs text-gray-400 uppercase tracking-wide">
            {label}
          </div>
          <div className="text-sm font-medium truncate">
            {selectedOption.label}
          </div>
        </div>
        
        {/* Chevron */}
        <ChevronIcon 
          size={16} 
          className="text-gray-400 flex-shrink-0 transition-transform duration-200" 
        />
      </button>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-2 w-full min-w-[200px] bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50"
          role="listbox"
        >
          {/* Options List */}
          <div className="py-1">
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isFirst = index === 0;
              const isLast = index === options.length - 1;
              
              return (
                <button
                  key={option.value}
                  onClick={() => handleOptionSelect(option.value)}
                  className={`
                    w-full text-left px-4 py-2.5 text-sm
                    transition-colors duration-150
                    ${isSelected 
                      ? 'bg-blue-600 text-white font-medium' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                    ${isFirst ? 'rounded-t-lg' : ''}
                    ${isLast ? 'rounded-b-lg' : ''}
                  `}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.label}</span>
                    {isSelected && (
                      <span className="text-xs opacity-75">Active</span>
                    )}
                  </div>
                  
                  {/* Optional description */}
                  {option.description && (
                    <div className={`text-xs mt-0.5 ${
                      isSelected ? 'text-blue-200' : 'text-gray-500'
                    }`}>
                      {option.description}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Professional Overlay Effect when Open */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default FilterDropdown;