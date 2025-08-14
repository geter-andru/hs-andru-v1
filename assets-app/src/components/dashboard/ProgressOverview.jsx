import React from 'react';

const CompetencyOverviewItem = ({ name, currentScore, level, color, unlocked, icon: Icon }) => {
  const getColorClasses = (color) => {
    switch (color) {
      case 'blue':
        return {
          progress: 'bg-blue-600',
          text: 'text-blue-400',
          background: 'bg-blue-900/20',
          border: 'border-blue-800'
        };
      case 'amber':
        return {
          progress: 'bg-amber-600',
          text: 'text-amber-400',
          background: 'bg-amber-900/20',
          border: 'border-amber-800'
        };
      case 'green':
        return {
          progress: 'bg-green-600',
          text: 'text-green-400',
          background: 'bg-green-900/20',
          border: 'border-green-800'
        };
      default:
        return {
          progress: 'bg-gray-600',
          text: 'text-gray-400',
          background: 'bg-gray-900/20',
          border: 'border-gray-800'
        };
    }
  };

  const colors = getColorClasses(color);

  return (
    <div className={`p-4 rounded-lg border ${colors.background} ${colors.border}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-gray-800 border border-gray-700`}>
            <Icon size={16} className={colors.text} />
          </div>
          <div>
            <div className="text-sm font-medium text-white">{name}</div>
            <div className="text-xs text-gray-500">{level}</div>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-lg font-semibold ${colors.text}`}>
            {currentScore}
          </div>
          <div className="text-xs text-gray-500">/100</div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-2">
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${colors.progress}`}
            style={{ width: `${currentScore}%` }}
          />
        </div>
      </div>
      
      {/* Status */}
      <div className="flex items-center justify-between text-xs">
        <span className={unlocked ? 'text-green-400' : 'text-gray-500'}>
          {unlocked ? '✓ Tools Unlocked' : '○ Tools Locked'}
        </span>
        <span className="text-gray-500">
          {currentScore >= 70 ? 'Proficient' : currentScore >= 50 ? 'Developing' : 'Foundation'}
        </span>
      </div>
    </div>
  );
};

const ProgressOverview = ({ competencyAreas, nextUnlock, className = '' }) => {
  return (
    <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">
        Professional Development Progress
      </h3>
      
      <div className="space-y-4">
        {competencyAreas.map((area) => (
          <CompetencyOverviewItem 
            key={area.name}
            name={area.name}
            currentScore={area.current}
            level={area.level}
            color={area.color}
            unlocked={area.unlocked}
            icon={area.icon}
          />
        ))}
      </div>
      
      {nextUnlock && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">Next Unlock</div>
            <div className="text-blue-400 font-medium">
              {nextUnlock.tool}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {nextUnlock.pointsNeeded} points needed • {nextUnlock.requirement}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { CompetencyOverviewItem };
export default ProgressOverview;