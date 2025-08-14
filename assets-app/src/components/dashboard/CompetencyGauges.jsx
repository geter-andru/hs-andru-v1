import React from 'react';
import CircularCompetencyGauge from './CircularCompetencyGauge';
import NextUnlockIndicator from './NextUnlockIndicator';

const CompetencyGauges = ({ competencyAreas, nextUnlock, onGaugeClick, className = '' }) => {
  // Handle gauge click for future detailed views
  const handleGaugeClick = (competencyName) => {
    console.log(`Opening detailed view for ${competencyName} competency`);
    if (onGaugeClick) {
      onGaugeClick(competencyName);
    }
  };

  return (
    <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
      {/* Professional Header */}
      <h3 className="text-lg font-semibold text-white mb-6">
        Professional Competency Development
      </h3>
      
      {/* Dynamic Circular Gauges Grid - Responsive Business Intelligence Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {competencyAreas.map((competency) => (
          <CircularCompetencyGauge 
            key={competency.name}
            name={competency.name}
            currentScore={competency.current}
            targetScore={70}
            level={competency.level}
            color={competency.color}
            unlockBenefit={competency.unlockBenefit}
            description={competency.description}
            onClick={handleGaugeClick}
          />
        ))}
      </div>
      
      {/* Professional Progression Indicator */}
      <NextUnlockIndicator 
        competencyAreas={competencyAreas}
        className="mt-6"
      />
      
      {/* Professional Development Context */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>Professional development tracking and tool access management</span>
          <span>Target: 70+ for tool unlock</span>
        </div>
      </div>
      
      {/* Advanced: Professional Development Balance Indicator */}
      <div className="mt-4 p-3 bg-gray-700 rounded-lg">
        <div className="text-xs text-gray-400 mb-2">Professional Development Balance</div>
        <div className="text-sm text-white">
          <span>Strongest: </span>
          <span className="text-blue-300 font-medium">
            {competencyAreas.reduce((max, comp) => comp.current > max.current ? comp : max, competencyAreas[0])?.name}
          </span>
          <span className="text-gray-400 mx-2">|</span>
          <span>Focus Area: </span>
          <span className="text-amber-300 font-medium">
            {competencyAreas.reduce((min, comp) => comp.current < min.current ? comp : min, competencyAreas[0])?.name}
          </span>
        </div>
      </div>
      
      {/* Professional Tips for Enhanced Engagement */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Click on competency gauges for detailed development insights and activity tracking
      </div>
    </div>
  );
};

export default CompetencyGauges;