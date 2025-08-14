import React from 'react';
import { ArrowRight, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import ActivityItem from './ActivityItem';

const RecentActivity = ({ activities, onViewAll, className = '' }) => {
  // Enhanced Phase 3 mock data with professional activity types
  const defaultActivities = [
    {
      id: 1,
      type: 'ICP_ANALYSIS',
      description: "Completed TechCorp customer analysis with detailed ICP scoring",
      timestamp: "2 hours ago",
      competencyCategory: "Customer Analysis",
      pointsEarned: 25,
      impactLevel: 'high'
    },
    {
      id: 2,
      type: 'COST_MODEL',
      description: "Built financial impact model for enterprise prospect", 
      timestamp: "Yesterday",
      competencyCategory: "Value Communication",
      pointsEarned: 35,
      impactLevel: 'high'
    },
    {
      id: 3,
      type: 'REAL_ACTION',
      description: "Presented ROI analysis to C-suite stakeholders",
      timestamp: "2 days ago", 
      competencyCategory: "Sales Execution",
      pointsEarned: 50,
      impactLevel: 'critical'
    },
    {
      id: 4,
      type: 'BUSINESS_CASE',
      description: "Created executive business case for $250K enterprise deal",
      timestamp: "3 days ago",
      competencyCategory: "Sales Execution", 
      pointsEarned: 40,
      impactLevel: 'high'
    },
    {
      id: 5,
      type: 'COMPETENCY_IMPROVEMENT',
      description: "Completed advanced customer psychology training module",
      timestamp: "1 week ago",
      competencyCategory: "Professional Development",
      pointsEarned: 30,
      impactLevel: 'medium'
    }
  ];

  const activitiesToShow = activities || defaultActivities;

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      console.log('View all activities clicked');
    }
  };

  // Calculate professional metrics for business intelligence display
  const totalPoints = activitiesToShow.reduce((sum, activity) => sum + (activity.pointsEarned || activity.points || 0), 0);
  const criticalActions = activitiesToShow.filter(activity => activity.impactLevel === 'critical').length;
  const weeklyVelocity = Math.round(totalPoints / 7); // Approximate weekly point velocity

  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 ${className}`}>
      {/* Professional Header with Business Intelligence Metrics */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            Professional Development Activity
          </h3>
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>Last 7 days</span>
          </div>
        </div>
        
        {/* Key Metrics Row - Business Intelligence Style */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {totalPoints}
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">
              Total Points
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {activitiesToShow.length}
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">
              Actions Taken
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {weeklyVelocity}
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">
              Daily Velocity
            </div>
          </div>
        </div>
      </div>
      
      {/* Activity Stream - Enhanced Professional Presentation */}
      <div className="p-6">
        <div className="space-y-3">
          {activitiesToShow.slice(0, 4).map((activity) => (
            <ActivityItem 
              key={activity.id}
              type={activity.type}
              description={activity.description}
              timestamp={activity.timestamp} 
              pointsEarned={activity.pointsEarned || activity.points}
              competencyCategory={activity.competencyCategory || activity.category}
              impactLevel={activity.impactLevel}
            />
          ))}
        </div>
        
        {/* View All Activities - Enhanced Professional Button */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <button 
            onClick={handleViewAll}
            className="w-full group bg-gray-700/50 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 rounded-lg py-3 px-4 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <span className="text-sm font-medium text-white group-hover:text-blue-100">
              View Complete Activity History
            </span>
            <ArrowRight size={16} className="text-gray-400 group-hover:text-blue-300 group-hover:translate-x-1 transition-all duration-200" />
          </button>
        </div>
        
        {/* Professional Performance Indicators */}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <BarChart3 className="w-3 h-3" />
            <span>{criticalActions} high-impact actions this week</span>
          </div>
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span className="text-green-400">+{weeklyVelocity} pts/day</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;