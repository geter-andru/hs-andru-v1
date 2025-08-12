import React, { useState, useEffect } from 'react';
import { ChevronRight, Lock, CheckCircle, Circle, Star, TrendingUp, Award } from 'lucide-react';
import { competencyService } from '../../services/competencyService';
import { useWorkflowProgress } from '../../hooks/useWorkflowProgress';

const MethodologyProgression = ({ customerId, onToolSelect, className = '' }) => {
  const [accessStatus, setAccessStatus] = useState({});
  const [currentLevel, setCurrentLevel] = useState(null);
  const { workflowProgress } = useWorkflowProgress(customerId);

  useEffect(() => {
    const loadProgression = async () => {
      if (!customerId) return;

      try {
        const status = await competencyService.getToolAccessStatus(customerId);
        setAccessStatus(status);
        
        const level = await competencyService.getUserCompetencyLevel(customerId);
        setCurrentLevel(level);
      } catch (error) {
        console.error('Error loading methodology progression:', error);
      }
    };

    loadProgression();
  }, [customerId, workflowProgress]);

  const methodologies = [
    {
      id: 'icp',
      name: 'Customer Intelligence Analysis',
      shortName: 'ICP Analysis',
      level: 'Foundation',
      levelNum: 1,
      icon: '🎯',
      color: 'blue',
      description: 'Foundational customer identification and profiling methodology',
      competency: 'Customer Analysis',
      benefits: [
        'Identify ideal customer profiles systematically',
        'Rate customer fit objectively',
        'Build foundation for strategic analysis'
      ],
      requirements: 'Always available - Entry methodology',
      status: workflowProgress?.icp_completed ? 'completed' : 'available'
    },
    {
      id: 'cost-calculator',
      name: 'Revenue Impact Quantification',
      shortName: 'Cost Calculator',
      level: 'Developing',
      levelNum: 2,
      icon: '📊',
      color: 'green',
      description: 'Advanced value articulation and cost modeling methodology',
      competency: 'Value Quantification',
      benefits: [
        'Calculate cost of inaction scenarios',
        'Project revenue impact systematically',
        'Create executive financial narratives'
      ],
      requirements: 'Complete 3 ICP analyses with 70%+ accuracy',
      status: accessStatus['cost-calculator']?.hasAccess 
        ? (workflowProgress?.cost_calculated ? 'completed' : 'available')
        : 'locked'
    },
    {
      id: 'business-case',
      name: 'Strategic Proposal Development',
      shortName: 'Business Case',
      level: 'Proficient',
      levelNum: 3,
      icon: '📋',
      color: 'purple',
      description: 'Executive business case and strategic framework development',
      competency: 'Strategic Development',
      benefits: [
        'Build comprehensive business cases',
        'Develop pilot-to-contract strategies',
        'Present executive-ready proposals'
      ],
      requirements: 'Complete 2 cost analyses with $100K+ impact',
      status: accessStatus['business-case']?.hasAccess
        ? (workflowProgress?.business_case_ready ? 'completed' : 'available')
        : 'locked'
    },
    {
      id: 'results',
      name: 'Executive Results Synthesis',
      shortName: 'Results',
      level: 'Executive',
      levelNum: 4,
      icon: '📈',
      color: 'yellow',
      description: 'Comprehensive strategic insights and recommendations',
      competency: 'Strategic Communication',
      benefits: [
        'Generate executive summaries',
        'Synthesize strategic insights',
        'Communicate comprehensive value'
      ],
      requirements: 'Complete full methodology progression',
      status: workflowProgress?.business_case_ready ? 'available' : 'locked'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'available':
        return <Circle className="w-5 h-5 text-blue-400" />;
      case 'locked':
        return <Lock className="w-5 h-5 text-gray-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getProgressPercentage = (methodId) => {
    if (!accessStatus[methodId]?.progress) return 0;
    const progress = accessStatus[methodId].progress;
    return Math.round((progress.completed / progress.required) * 100);
  };

  const handleMethodologyClick = (method) => {
    if (method.status !== 'locked' && onToolSelect) {
      onToolSelect(method.id);
    }
  };

  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-b border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              Methodology Progression Framework
            </h2>
            <p className="text-gray-300 text-sm">
              Systematic business analysis methodology development path
            </p>
          </div>
          {currentLevel && (
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-1">
                <Award className="w-5 h-5 text-yellow-400" />
                <span className="text-lg font-semibold text-white">
                  {currentLevel.title}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {currentLevel.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Progression Path */}
      <div className="p-6">
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-700" />

          {/* Methodologies */}
          <div className="space-y-6">
            {methodologies.map((method, index) => {
              const isLocked = method.status === 'locked';
              const isCompleted = method.status === 'completed';
              const isAvailable = method.status === 'available';
              const progress = getProgressPercentage(method.id);

              return (
                <div key={method.id} className="relative">
                  {/* Node */}
                  <div
                    className={`absolute left-5 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 ${
                      isCompleted ? 'bg-green-900 border-green-600' :
                      isAvailable ? 'bg-blue-900 border-blue-600' :
                      'bg-gray-800 border-gray-600'
                    }`}
                  >
                    {isCompleted && <CheckCircle className="w-4 h-4 text-green-400" />}
                    {isAvailable && !isCompleted && <Circle className="w-3 h-3 text-blue-400 fill-current" />}
                    {isLocked && <Lock className="w-3 h-3 text-gray-500" />}
                  </div>

                  {/* Card */}
                  <div 
                    className={`ml-14 cursor-pointer transition-all duration-300 ${
                      isLocked ? 'opacity-60' : 'hover:scale-[1.02]'
                    }`}
                    onClick={() => handleMethodologyClick(method)}
                  >
                    <div className={`bg-gray-800 border rounded-lg p-5 ${
                      isCompleted ? 'border-green-700' :
                      isAvailable ? 'border-blue-700' :
                      'border-gray-700'
                    }`}>
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-3">
                          <div className="text-2xl">{method.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className={`font-semibold ${
                                isLocked ? 'text-gray-400' : 'text-white'
                              }`}>
                                {method.name}
                              </h3>
                              {getStatusIcon(method.status)}
                            </div>
                            <div className="flex items-center space-x-3 text-xs">
                              <span className={`px-2 py-1 rounded-full ${
                                isLocked ? 'bg-gray-700 text-gray-500' :
                                `bg-${method.color}-900/50 text-${method.color}-300 border border-${method.color}-700`
                              }`}>
                                {method.level} • Level {method.levelNum}
                              </span>
                              <span className="text-gray-400">
                                {method.competency}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Progress or Status */}
                        {isLocked && progress > 0 && (
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-300">
                              {progress}%
                            </div>
                            <div className="text-xs text-gray-500">Progress</div>
                          </div>
                        )}
                        {isCompleted && (
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        )}
                      </div>

                      {/* Description */}
                      <p className={`text-sm mb-3 ${
                        isLocked ? 'text-gray-500' : 'text-gray-300'
                      }`}>
                        {method.description}
                      </p>

                      {/* Progress Bar for Locked */}
                      {isLocked && progress > 0 && (
                        <div className="mb-3">
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className={`bg-gradient-to-r from-${method.color}-500 to-${method.color}-400 h-2 rounded-full transition-all duration-500`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Requirements or Benefits */}
                      {isLocked ? (
                        <div className="bg-gray-900 rounded p-3 border border-gray-700">
                          <div className="flex items-start space-x-2">
                            <Lock className="w-4 h-4 text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-gray-400 mb-1">
                                Unlock Requirements
                              </p>
                              <p className="text-xs text-gray-500">
                                {method.requirements}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-gray-400">
                            Methodology Benefits:
                          </p>
                          <div className="grid grid-cols-1 gap-1">
                            {method.benefits.slice(0, 2).map((benefit, idx) => (
                              <div key={idx} className="flex items-start space-x-2">
                                <ChevronRight className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-gray-400">{benefit}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      {!isLocked && (
                        <div className="mt-4 flex items-center justify-between">
                          <button className={`text-xs font-medium ${
                            isCompleted ? 'text-green-400' : 'text-blue-400'
                          } hover:underline`}>
                            {isCompleted ? 'Review Methodology' : 'Access Methodology'} →
                          </button>
                          {isAvailable && !isCompleted && (
                            <span className="text-xs text-yellow-400 font-medium animate-pulse">
                              Ready to Begin
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Professional Guidance Footer */}
        <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex items-start space-x-3">
            <TrendingUp className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">
                Professional Development Philosophy
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Our systematic methodology progression ensures optimal implementation success. 
                Each level builds upon previous competencies, creating a comprehensive business 
                analysis capability that delivers measurable strategic value.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MethodologyProgression;