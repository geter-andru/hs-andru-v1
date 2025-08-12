import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, Target, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { competencyService } from '../../services/competencyService';

const CompetencyReadiness = ({ customerId, targetTool = 'cost-calculator', className = '' }) => {
  const [readinessData, setReadinessData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nextMilestone, setNextMilestone] = useState(null);

  useEffect(() => {
    const checkReadiness = async () => {
      if (!customerId) return;

      try {
        setLoading(true);
        
        // Get access status for target tool
        const accessStatus = await competencyService.getToolAccessStatus(customerId);
        const targetStatus = accessStatus[targetTool];
        
        if (targetStatus) {
          setReadinessData(targetStatus);
          
          // Calculate next milestone
          if (!targetStatus.hasAccess && targetStatus.progress) {
            const remaining = targetStatus.progress.required - targetStatus.progress.completed;
            setNextMilestone({
              remaining,
              percentComplete: Math.round((targetStatus.progress.completed / targetStatus.progress.required) * 100),
              estimatedTime: remaining * (targetTool === 'cost-calculator' ? 10 : 15), // minutes
              nextAction: targetStatus.progress.nextRequirement
            });
          }
        }
      } catch (error) {
        console.error('Error checking competency readiness:', error);
      } finally {
        setLoading(false);
      }
    };

    checkReadiness();
  }, [customerId, targetTool]);

  if (loading || !readinessData) return null;

  const getToolMetadata = () => {
    const metadata = {
      'cost-calculator': {
        name: 'Cost of Inaction Calculator',
        icon: '📊',
        competency: 'Value Quantification',
        level: 'Developing Level',
        color: 'green',
        benefits: [
          'Quantify revenue impact systematically',
          'Build executive-ready financial cases',
          'Demonstrate tangible business value'
        ]
      },
      'business-case': {
        name: 'Business Case Builder',
        icon: '📋',
        competency: 'Strategic Development',
        level: 'Proficient Level',
        color: 'purple',
        benefits: [
          'Create comprehensive strategic proposals',
          'Develop pilot-to-contract frameworks',
          'Present executive-level business cases'
        ]
      }
    };
    return metadata[targetTool] || metadata['cost-calculator'];
  };

  const toolMeta = getToolMetadata();
  const progress = readinessData.progress || { required: 0, completed: 0 };
  const progressPercent = progress.required > 0 ? (progress.completed / progress.required) * 100 : 0;

  // Already has access - show competency achieved
  if (readinessData.hasAccess) {
    return (
      <div className={`bg-green-900/20 border border-green-700 rounded-lg p-6 ${className}`}>
        <div className="flex items-start space-x-4">
          <div className="text-3xl">{toolMeta.icon}</div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-green-300">
                {toolMeta.competency} Competency Achieved
              </h3>
            </div>
            <p className="text-green-200 text-sm">
              {toolMeta.name} is available for immediate use. Your demonstrated expertise enables 
              access to advanced {toolMeta.competency.toLowerCase()} methodologies.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show readiness progress
  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className={`bg-gradient-to-r from-${toolMeta.color}-900/50 to-${toolMeta.color}-800/50 border-b border-gray-700 p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{toolMeta.icon}</div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Competency Readiness Assessment
              </h3>
              <p className="text-sm text-gray-300">
                {toolMeta.name} - {toolMeta.level}
              </p>
            </div>
          </div>
          <div className={`px-3 py-1 bg-${toolMeta.color}-900/50 border border-${toolMeta.color}-700 rounded-full`}>
            <span className={`text-xs font-medium text-${toolMeta.color}-300`}>
              {toolMeta.competency}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="p-6 space-y-6">
        {/* Overall Progress */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold text-gray-300 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-blue-400" />
              Progress to Unlock
            </h4>
            <span className="text-2xl font-bold text-white">
              {Math.round(progressPercent)}%
            </span>
          </div>

          <div className="space-y-3">
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className={`bg-gradient-to-r from-${toolMeta.color}-500 to-${toolMeta.color}-400 h-3 rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
                style={{ width: `${progressPercent}%` }}
              >
                {progressPercent > 10 && (
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                )}
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-400">
                {progress.completed} of {progress.required} requirements met
              </span>
              {nextMilestone && (
                <span className="text-gray-400">
                  {nextMilestone.remaining} remaining
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Requirements Status */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center">
            <Target className="w-4 h-4 mr-2 text-yellow-400" />
            Unlock Requirements
          </h4>
          
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                progress.completed >= progress.required 
                  ? 'bg-green-900 border-green-600' 
                  : 'border-gray-600'
              }`}>
                {progress.completed >= progress.required && (
                  <CheckCircle className="w-3 h-3 text-green-400" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-300">
                  {readinessData.reason}
                </p>
                {progress.nextRequirement && (
                  <p className="text-xs text-gray-500 mt-1">
                    Next: {progress.nextRequirement}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Time Estimate */}
        {nextMilestone && nextMilestone.estimatedTime > 0 && (
          <div className="flex items-center justify-between p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm font-medium text-blue-300">
                  Estimated Time to Unlock
                </p>
                <p className="text-xs text-blue-200">
                  Based on typical progression patterns
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-white">
                ~{nextMilestone.estimatedTime} min
              </p>
              <p className="text-xs text-gray-400">
                {nextMilestone.remaining} activities
              </p>
            </div>
          </div>
        )}

        {/* Professional Benefits */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-300 flex items-center">
            <Award className="w-4 h-4 mr-2 text-purple-400" />
            Methodology Benefits Upon Unlock
          </h4>
          <div className="space-y-2">
            {toolMeta.benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-1.5 flex-shrink-0" />
                <p className="text-sm text-gray-400">{benefit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Professional Guidance */}
        <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-yellow-400">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="text-sm font-semibold text-yellow-400 mb-1">
                Professional Development Guidance
              </h5>
              <p className="text-xs text-gray-300 leading-relaxed">
                Systematic methodology progression ensures optimal implementation success. 
                Continue developing foundational competencies to unlock advanced strategic capabilities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetencyReadiness;