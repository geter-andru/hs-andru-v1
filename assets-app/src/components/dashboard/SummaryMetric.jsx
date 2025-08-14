import React from 'react';
import { TrendingUp, TrendingDown, Minus, ChevronUp } from 'lucide-react';

const SummaryMetric = ({ 
  label, 
  value, 
  previousValue, 
  format = 'number',
  suffix = '',
  prefix = '',
  trend = 'neutral',
  className = '',
  size = 'default',
  showTrend = true,
  showChange = true 
}) => {
  // Calculate change metrics
  const calculateChange = () => {
    if (!previousValue || previousValue === 0) return null;
    
    const rawChange = value - previousValue;
    const percentChange = ((rawChange / previousValue) * 100);
    
    return {
      raw: rawChange,
      percent: percentChange,
      isPositive: rawChange > 0,
      isNegative: rawChange < 0,
      isNeutral: rawChange === 0
    };
  };

  const change = calculateChange();

  // Format value based on type
  const formatValue = (val) => {
    switch (format) {
      case 'percentage':
        return `${val}%`;
      case 'currency':
        return `$${val.toLocaleString()}`;
      case 'decimal':
        return val.toFixed(1);
      case 'large_number':
        if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
        return val.toString();
      default:
        return val.toLocaleString();
    }
  };

  // Get trend styling
  const getTrendStyling = () => {
    if (!change) {
      return {
        icon: Minus,
        color: 'text-gray-400',
        bgColor: 'bg-gray-700/30',
        direction: 'neutral'
      };
    }

    if (change.isPositive) {
      return {
        icon: TrendingUp,
        color: 'text-green-400',
        bgColor: 'bg-green-900/30',
        direction: 'up'
      };
    } else if (change.isNegative) {
      return {
        icon: TrendingDown,
        color: 'text-red-400', 
        bgColor: 'bg-red-900/30',
        direction: 'down'
      };
    } else {
      return {
        icon: Minus,
        color: 'text-gray-400',
        bgColor: 'bg-gray-700/30',
        direction: 'neutral'
      };
    }
  };

  const trendStyling = getTrendStyling();
  const TrendIcon = trendStyling.icon;

  // Size variants
  const sizeClasses = {
    small: {
      value: 'text-lg font-semibold',
      label: 'text-xs',
      change: 'text-xs',
      icon: 12
    },
    default: {
      value: 'text-2xl font-bold',
      label: 'text-sm',
      change: 'text-sm',
      icon: 16
    },
    large: {
      value: 'text-3xl font-bold',
      label: 'text-base',
      change: 'text-base', 
      icon: 20
    }
  };

  const sizes = sizeClasses[size] || sizeClasses.default;

  return (
    <div className={`group ${className}`}>
      {/* Main Metric Display */}
      <div className="space-y-2">
        {/* Value with Prefix/Suffix */}
        <div className={`${sizes.value} text-white font-mono tracking-tight group-hover:text-blue-100 transition-colors`}>
          {prefix}{formatValue(value)}{suffix}
        </div>
        
        {/* Label */}
        <div className={`${sizes.label} text-gray-400 uppercase tracking-wide font-medium`}>
          {label}
        </div>
        
        {/* Change Indicators */}
        {(showChange || showTrend) && change && (
          <div className="flex items-center space-x-2">
            {/* Trend Icon */}
            {showTrend && (
              <div className={`flex items-center justify-center w-6 h-6 rounded-full ${trendStyling.bgColor}`}>
                <TrendIcon 
                  size={sizes.icon} 
                  className={trendStyling.color}
                />
              </div>
            )}
            
            {/* Change Values */}
            {showChange && (
              <div className="flex items-center space-x-2">
                {/* Percentage Change */}
                <span className={`${sizes.change} font-medium ${trendStyling.color}`}>
                  {change.isPositive ? '+' : ''}{change.percent.toFixed(1)}%
                </span>
                
                {/* Raw Change */}
                <span className={`${sizes.change} text-gray-500`}>
                  ({change.isPositive ? '+' : ''}{formatValue(change.raw)})
                </span>
              </div>
            )}
          </div>
        )}
        
        {/* Additional Context for No Previous Value */}
        {!change && previousValue === 0 && (
          <div className="flex items-center space-x-1">
            <div className="w-6 h-6 rounded-full bg-blue-900/30 flex items-center justify-center">
              <ChevronUp size={12} className="text-blue-400" />
            </div>
            <span className={`${sizes.change} text-blue-400 font-medium`}>
              New baseline
            </span>
          </div>
        )}
      </div>
      
      {/* Professional Hover Enhancement */}
      <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
        <div className="mt-2 text-xs text-gray-500 text-center">
          {change ? `vs. previous period` : 'baseline metric'}
        </div>
      </div>
    </div>
  );
};

export default SummaryMetric;