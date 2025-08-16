import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { 
  TrendingUp, 
  Target, 
  Award, 
  ChevronRight, 
  Clock,
  BarChart3,
  Users,
  FileText,
  ArrowUp,
  CheckCircle,
  Activity
} from 'lucide-react';
import { useUserIntelligence } from '../../contexts/simplified/UserIntelligenceContext';
import TaskRecommendationsSection from './TaskRecommendationsSection';

const SimplifiedDashboard = ({ customerId }) => {
  const navigate = useNavigate();
  const { assessment, milestone, usage, loading, error, updateUsage } = useUserIntelligence();
  const [animatedScores, setAnimatedScores] = useState({
    customerAnalysis: 0,
    valueCommunication: 0,
    executiveReadiness: 0
  });

  // Animate competency scores on mount
  useEffect(() => {
    if (!assessment?.competencyScores) return;
    
    const timer = setTimeout(() => {
      setAnimatedScores(assessment.competencyScores);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [assessment]);

  // Ensure we have safe competency scores for rendering
  const safeCompetencyScores = assessment?.competencyScores || {
    customerAnalysis: 50,
    valueCommunication: 50,
    executiveReadiness: 50
  };

  // Generate milestone-specific recommended actions
  const recommendedActions = useMemo(() => {
    if (!milestone || !assessment?.competencyScores) return [];
    
    const actions = {
      foundation: [
        { 
          id: 1,
          title: 'Complete ICP Analysis',
          description: 'Establish systematic buyer targeting framework',
          tool: 'icp',
          priority: 'high',
          icon: Target,
          progress: usage?.icpProgress || 0
        },
        { 
          id: 2,
          title: 'Calculate Financial Impact',
          description: 'Quantify technical value in business terms',
          tool: 'financial',
          priority: 'high',
          icon: BarChart3,
          progress: usage?.financialProgress || 0
        },
        { 
          id: 3,
          title: 'Document Value Patterns',
          description: 'Build reusable value communication templates',
          tool: 'resources',
          priority: 'medium',
          icon: FileText,
          progress: usage?.resourcesAccessed || 0
        }
      ],
      growth: [
        { 
          id: 1,
          title: 'Optimize Enterprise Messaging',
          description: 'Refine stakeholder-specific value propositions',
          tool: 'financial',
          priority: 'high',
          icon: Users,
          progress: usage?.financialProgress || 0
        },
        { 
          id: 2,
          title: 'Build Competitive Intelligence',
          description: 'Develop systematic competitive positioning',
          tool: 'icp',
          priority: 'high',
          icon: Target,
          progress: usage?.icpProgress || 0
        },
        { 
          id: 3,
          title: 'Scale Team Enablement',
          description: 'Create systematic training resources',
          tool: 'resources',
          priority: 'medium',
          icon: FileText,
          progress: usage?.resourcesAccessed || 0
        }
      ],
      expansion: [
        { 
          id: 1,
          title: 'Master Executive Communication',
          description: 'Perfect board-level value articulation',
          tool: 'financial',
          priority: 'high',
          icon: Award,
          progress: usage?.financialProgress || 0
        },
        { 
          id: 2,
          title: 'Strategic Market Intelligence',
          description: 'Advanced competitive and market analysis',
          tool: 'icp',
          priority: 'high',
          icon: Target,
          progress: usage?.icpProgress || 0
        },
        { 
          id: 3,
          title: 'Series B Preparation',
          description: 'Optimize revenue operations for next funding',
          tool: 'resources',
          priority: 'high',
          icon: TrendingUp,
          progress: usage?.resourcesAccessed || 0
        }
      ]
    };
    
    // Filter based on competency gaps
    const tierActions = actions[milestone.tier] || actions.foundation;
    
    // Prioritize based on lowest competency scores
    const gaps = [];
    if (assessment?.competencyScores && milestone?.targets) {
      if (assessment.competencyScores.customerAnalysis < milestone.targets.customerAnalysis) {
        gaps.push('customerAnalysis');
      }
      if (assessment.competencyScores.valueCommunication < milestone.targets.valueCommunication) {
        gaps.push('valueCommunication');
      }
      if (assessment.competencyScores.executiveReadiness < milestone.targets.executiveReadiness) {
        gaps.push('executiveReadiness');
      }
    }
    
    return tierActions;
  }, [milestone, assessment, usage]);

  // Recent activity (stealth achievements)
  const recentActivity = useMemo(() => {
    const activities = [];
    
    if (usage?.lastICPExport) {
      activities.push({
        id: 1,
        title: 'ICP Analysis Exported',
        description: 'Systematic buyer framework documented',
        timestamp: usage.lastICPExport,
        icon: CheckCircle,
        type: 'success'
      });
    }
    
    if (usage?.lastFinancialCalculation) {
      activities.push({
        id: 2,
        title: 'Financial Impact Calculated',
        description: 'Business value quantified',
        timestamp: usage.lastFinancialCalculation,
        icon: BarChart3,
        type: 'progress'
      });
    }
    
    if (usage?.resourcesAccessed > 5) {
      activities.push({
        id: 3,
        title: 'Resource Library Active',
        description: `${usage.resourcesAccessed} resources accessed`,
        timestamp: Date.now(),
        icon: FileText,
        type: 'info'
      });
    }
    
    return activities.slice(0, 3);
  }, [usage]);

  // Calculate next milestone
  const nextMilestone = useMemo(() => {
    const milestoneMap = {
      foundation: {
        current: 'Foundation Building',
        next: 'Growth Scaling',
        requirement: 'Achieve 70% competency across all areas'
      },
      growth: {
        current: 'Growth Scaling',
        next: 'Market Expansion',
        requirement: 'Achieve 85% competency and $75K+ MRR'
      },
      expansion: {
        current: 'Market Expansion',
        next: 'Market Leadership',
        requirement: 'Maintain 90% competency and scale operations'
      }
    };
    
    return milestoneMap[milestone?.tier] || milestoneMap.foundation;
  }, [milestone]);

  // Handle task completion with usage tracking
  const handleTaskCompletion = useCallback((task, completionData) => {
    // Update usage data with task completion
    updateUsage({
      tasksCompleted: (usage?.tasksCompleted || 0) + 1,
      lastTaskCompletion: Date.now(),
      taskCompetencyGains: {
        ...usage?.taskCompetencyGains,
        [task.competencyArea]: (usage?.taskCompetencyGains?.[task.competencyArea] || 0) + completionData.competencyGain
      },
      completedTaskCategories: {
        ...usage?.completedTaskCategories,
        [task.category]: (usage?.completedTaskCategories?.[task.category] || 0) + 1
      }
    });
  }, [updateUsage, usage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading revenue intelligence platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Revenue Intelligence Hub</h1>
          <p className="text-gray-400">Systematic business development platform for technical founders</p>
        </div>

        {/* Milestone Context Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Your Revenue Development Phase
              </h3>
              <p className="text-gray-300 mb-3">{milestone?.context}</p>
              <div className="space-y-2">
                <p className="text-sm text-blue-400">
                  <span className="font-medium">Current Phase:</span> {nextMilestone.current}
                </p>
                <p className="text-sm text-green-400">
                  <span className="font-medium">Next Phase:</span> {nextMilestone.next}
                </p>
                <p className="text-sm text-gray-400">
                  <span className="font-medium">Requirement:</span> {nextMilestone.requirement}
                </p>
                <p className="text-sm text-purple-400">
                  <span className="font-medium">Focus Timeline:</span> {milestone?.timeframe}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white mb-1">
                {assessment?.performance?.level || 'Developing'}
              </div>
              <div className="text-sm text-gray-400">Performance Level</div>
              <div className="mt-2 text-green-400 font-semibold">
                ${Math.round((assessment?.revenue?.opportunity || 500000) / 1000)}K
              </div>
              <div className="text-sm text-gray-400">Revenue Opportunity</div>
            </div>
          </div>
        </div>

        {/* Competency Progress Circles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Customer Analysis */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Customer Analysis</h3>
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <div className="w-32 h-32 mx-auto mb-4">
              <CircularProgressbar
                value={animatedScores.customerAnalysis}
                text={`${animatedScores.customerAnalysis}%`}
                styles={buildStyles({
                  textColor: '#fff',
                  pathColor: '#3B82F6',
                  trailColor: '#1F2937',
                  pathTransitionDuration: 0.5,
                })}
              />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-1">Target: {milestone?.targets?.customerAnalysis}%</p>
              <p className="text-xs text-gray-500">Systematic buyer understanding</p>
            </div>
          </div>

          {/* Value Communication */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Value Communication</h3>
              <Activity className="w-5 h-5 text-green-400" />
            </div>
            <div className="w-32 h-32 mx-auto mb-4">
              <CircularProgressbar
                value={animatedScores.valueCommunication}
                text={`${animatedScores.valueCommunication}%`}
                styles={buildStyles({
                  textColor: '#fff',
                  pathColor: '#10B981',
                  trailColor: '#1F2937',
                  pathTransitionDuration: 0.5,
                })}
              />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-1">Target: {milestone?.targets?.valueCommunication}%</p>
              <p className="text-xs text-gray-500">Technical-to-business translation</p>
            </div>
          </div>

          {/* Executive Readiness */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Executive Readiness</h3>
              <Award className="w-5 h-5 text-purple-400" />
            </div>
            <div className="w-32 h-32 mx-auto mb-4">
              <CircularProgressbar
                value={animatedScores.executiveReadiness}
                text={`${animatedScores.executiveReadiness}%`}
                styles={buildStyles({
                  textColor: '#fff',
                  pathColor: '#8B5CF6',
                  trailColor: '#1F2937',
                  pathTransitionDuration: 0.5,
                })}
              />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-1">Target: {milestone?.targets?.executiveReadiness}%</p>
              <p className="text-xs text-gray-500">Board-level communication</p>
            </div>
          </div>
        </div>

        {/* Task Recommendations and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Task Recommendations - Main section (2/3 width) */}
          <div className="lg:col-span-2">
            <TaskRecommendationsSection
              customerData={{
                milestone,
                competencyScores: assessment?.competencyScores,
                ...assessment
              }}
              usageAssessment={{ usage, assessment }}
              customerId={customerId}
              onTaskComplete={handleTaskCompletion}
            />
          </div>

          {/* Recent Activity - Sidebar (1/3 width) */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'success' ? 'bg-green-900/30' :
                        activity.type === 'progress' ? 'bg-blue-900/30' :
                        'bg-gray-800'
                      }`}>
                        <activity.icon className={`w-4 h-4 ${
                          activity.type === 'success' ? 'text-green-400' :
                          activity.type === 'progress' ? 'text-blue-400' :
                          'text-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{activity.title}</p>
                        <p className="text-gray-400 text-xs">{activity.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No recent activity. Start with recommended tasks.</p>
              )}
            </div>

            {/* Legacy Recommended Actions - Keep as fallback quick actions */}
            <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-base font-medium text-gray-300 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {recommendedActions.slice(0, 3).map((action) => (
                  <button
                    key={action.id}
                    onClick={() => navigate(`/customer/${customerId}/simplified/${action.tool}`)}
                    className="w-full text-left p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors group text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <action.icon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">{action.title}</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-gray-500 group-hover:text-gray-300" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate(`/customer/${customerId}/simplified/icp`)}
            className="p-4 bg-gray-900 border border-gray-800 hover:border-blue-500 rounded-xl transition-all group"
          >
            <Target className="w-6 h-6 text-blue-400 mb-2" />
            <h4 className="text-white font-medium mb-1">ICP Analysis</h4>
            <p className="text-gray-400 text-sm">Systematic buyer understanding</p>
          </button>

          <button
            onClick={() => navigate(`/customer/${customerId}/simplified/financial`)}
            className="p-4 bg-gray-900 border border-gray-800 hover:border-green-500 rounded-xl transition-all group"
          >
            <BarChart3 className="w-6 h-6 text-green-400 mb-2" />
            <h4 className="text-white font-medium mb-1">Financial Impact</h4>
            <p className="text-gray-400 text-sm">Calculate & communicate value</p>
          </button>

          <button
            onClick={() => navigate(`/customer/${customerId}/simplified/resources`)}
            className="p-4 bg-gray-900 border border-gray-800 hover:border-purple-500 rounded-xl transition-all group"
          >
            <FileText className="w-6 h-6 text-purple-400 mb-2" />
            <h4 className="text-white font-medium mb-1">Resource Library</h4>
            <p className="text-gray-400 text-sm">Implementation templates</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedDashboard;