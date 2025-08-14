/**
 * Real-World Action Tracker - Phase 3
 * 
 * Professional action tracking system with honor-based verification
 * Enables users to log real business activities and earn competency points
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Calendar, Target, TrendingUp, Award, 
  CheckCircle, Clock, Users, DollarSign, FileText,
  BarChart3, Lightbulb, Star, AlertCircle, ExternalLink
} from 'lucide-react';
import { assessmentService } from '../../services/assessmentService';

const RealWorldActionTracker = ({ 
  competencyData, 
  onProgressUpdate, 
  className = '' 
}) => {
  const [showAddAction, setShowAddAction] = useState(false);
  const [completedActions, setCompletedActions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [actionForm, setActionForm] = useState({
    type: '',
    category: '',
    description: '',
    impact: 'medium',
    evidence: '',
    tags: []
  });

  // Action types with professional terminology
  const actionTypes = [
    {
      id: 'customer_meeting',
      name: 'Customer Discovery Meeting',
      category: 'customerAnalysis',
      description: 'Conducted structured customer discovery session',
      icon: Users,
      basePoints: 100,
      color: 'blue',
      timeEstimate: '1-2 hours'
    },
    {
      id: 'prospect_qualification',
      name: 'Prospect Qualification',
      category: 'customerAnalysis',
      description: 'Applied systematic qualification framework',
      icon: Target,
      basePoints: 75,
      color: 'blue',
      timeEstimate: '30-60 minutes'
    },
    {
      id: 'value_proposition_delivery',
      name: 'Value Proposition Presentation',
      category: 'valueCommunication',
      description: 'Delivered tailored value proposition to stakeholders',
      icon: TrendingUp,
      basePoints: 150,
      color: 'green',
      timeEstimate: '1-2 hours'
    },
    {
      id: 'roi_presentation',
      name: 'ROI Analysis Presentation',
      category: 'valueCommunication',
      description: 'Presented comprehensive ROI analysis to decision makers',
      icon: BarChart3,
      basePoints: 200,
      color: 'green',
      timeEstimate: '2-3 hours'
    },
    {
      id: 'proposal_creation',
      name: 'Business Proposal Development',
      category: 'salesExecution',
      description: 'Created comprehensive business proposal or RFP response',
      icon: FileText,
      basePoints: 250,
      color: 'purple',
      timeEstimate: '4-8 hours'
    },
    {
      id: 'deal_closure',
      name: 'Deal Closure Achievement',
      category: 'salesExecution',
      description: 'Successfully closed business opportunity',
      icon: Award,
      basePoints: 500,
      color: 'purple',
      timeEstimate: 'Variable'
    },
    {
      id: 'referral_generation',
      name: 'Referral Generation',
      category: 'salesExecution',
      description: 'Generated qualified referral from existing relationship',
      icon: ExternalLink,
      basePoints: 300,
      color: 'purple',
      timeEstimate: '1-2 hours'
    },
    {
      id: 'case_study_development',
      name: 'Case Study Development',
      category: 'valueCommunication',
      description: 'Developed customer success case study',
      icon: Lightbulb,
      basePoints: 400,
      color: 'green',
      timeEstimate: '3-5 hours'
    }
  ];

  // Impact levels for point calculation
  const impactLevels = [
    { 
      id: 'low', 
      name: 'Standard Impact', 
      description: 'Routine business activity',
      multiplier: 0.8,
      color: 'gray'
    },
    { 
      id: 'medium', 
      name: 'Significant Impact', 
      description: 'Important business milestone',
      multiplier: 1.0,
      color: 'blue'
    },
    { 
      id: 'high', 
      name: 'High Impact', 
      description: 'Major business achievement',
      multiplier: 1.5,
      color: 'green'
    },
    { 
      id: 'critical', 
      name: 'Critical Impact', 
      description: 'Exceptional business outcome',
      multiplier: 2.0,
      color: 'purple'
    }
  ];

  // Category filters
  const categoryFilters = [
    { id: 'all', name: 'All Activities', icon: BarChart3 },
    { id: 'customerAnalysis', name: 'Customer Analysis', icon: Target },
    { id: 'valueCommunication', name: 'Value Communication', icon: TrendingUp },
    { id: 'salesExecution', name: 'Sales Execution', icon: Award }
  ];

  // Load completed actions (would come from Airtable in Phase 4)
  useEffect(() => {
    // Mock data for demonstration
    const mockActions = [
      {
        id: 'action_1',
        type: 'customer_meeting',
        category: 'customerAnalysis',
        description: 'Discovery call with TechCorp about automation needs',
        impact: 'medium',
        pointsAwarded: 100,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        verified: true
      },
      {
        id: 'action_2',
        type: 'value_proposition_delivery',
        category: 'valueCommunication',
        description: 'ROI presentation to DataFlow executive team',
        impact: 'high',
        pointsAwarded: 225,
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        verified: true
      }
    ];
    
    setCompletedActions(mockActions);
  }, []);

  // Handle form submission
  const handleSubmitAction = useCallback(async (e) => {
    e.preventDefault();
    
    if (!actionForm.type || !actionForm.description) {
      return;
    }

    try {
      // Calculate points
      const actionType = actionTypes.find(t => t.id === actionForm.type);
      const impactLevel = impactLevels.find(l => l.id === actionForm.impact);
      const points = Math.round(actionType.basePoints * impactLevel.multiplier);

      // Create action record
      const newAction = {
        id: `action_${Date.now()}`,
        type: actionForm.type,
        category: actionType.category,
        description: actionForm.description,
        impact: actionForm.impact,
        evidence: actionForm.evidence,
        pointsAwarded: points,
        timestamp: new Date().toISOString(),
        verified: true // Honor system
      };

      // Update local state
      setCompletedActions(prev => [newAction, ...prev]);

      // Award progress points
      if (onProgressUpdate) {
        onProgressUpdate({
          points,
          action: `Real-world action: ${actionType.name}`,
          category: actionType.category,
          timestamp: newAction.timestamp
        });
      }

      // Reset form
      setActionForm({
        type: '',
        category: '',
        description: '',
        impact: 'medium',
        evidence: '',
        tags: []
      });
      setShowAddAction(false);

      // Track with assessment service
      await assessmentService.trackRealWorldAction('current_user', newAction);

    } catch (error) {
      console.error('Error submitting action:', error);
    }
  }, [actionForm, actionTypes, impactLevels, onProgressUpdate]);

  // Filter actions by category
  const filteredActions = completedActions.filter(action => {
    if (selectedCategory === 'all') return true;
    return action.category === selectedCategory;
  });

  // Calculate statistics
  const stats = {
    totalActions: completedActions.length,
    totalPoints: completedActions.reduce((sum, action) => sum + action.pointsAwarded, 0),
    thisWeek: completedActions.filter(action => {
      const actionDate = new Date(action.timestamp);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return actionDate >= weekAgo;
    }).length,
    averageImpact: completedActions.length > 0 
      ? completedActions.reduce((sum, action) => {
          const level = impactLevels.find(l => l.id === action.impact);
          return sum + (level ? level.multiplier : 1);
        }, 0) / completedActions.length 
      : 0
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Statistics */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Real-World Action Tracking
            </h3>
            <p className="text-gray-400">
              Log professional activities to earn competency points and track business impact
            </p>
          </div>
          
          <button
            onClick={() => setShowAddAction(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Log Action</span>
          </button>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">{stats.totalActions}</div>
            <div className="text-sm text-gray-400">Total Actions</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">{stats.totalPoints}</div>
            <div className="text-sm text-gray-400">Points Earned</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">{stats.thisWeek}</div>
            <div className="text-sm text-gray-400">This Week</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">{stats.averageImpact.toFixed(1)}x</div>
            <div className="text-sm text-gray-400">Avg Impact</div>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categoryFilters.map(filter => {
          const Icon = filter.icon;
          const isActive = selectedCategory === filter.id;
          
          return (
            <button
              key={filter.id}
              onClick={() => setSelectedCategory(filter.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{filter.name}</span>
            </button>
          );
        })}
      </div>

      {/* Actions List */}
      <div className="space-y-4">
        {filteredActions.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <h4 className="text-lg font-medium mb-2">No Actions Recorded</h4>
              <p>Start logging your professional activities to track progress and earn points</p>
            </div>
            <button
              onClick={() => setShowAddAction(true)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
            >
              Log Your First Action
            </button>
          </div>
        ) : (
          filteredActions.map((action) => {
            const actionType = actionTypes.find(t => t.id === action.type);
            const impactLevel = impactLevels.find(l => l.id === action.impact);
            const Icon = actionType?.icon || Target;
            
            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`w-12 h-12 bg-${actionType?.color || 'gray'}-600 rounded-lg flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-white mb-1">
                        {actionType?.name || 'Unknown Action'}
                      </h4>
                      <p className="text-gray-400 mb-3">{action.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(action.timestamp).toLocaleDateString()}</span>
                        </span>
                        
                        <span className={`px-2 py-1 rounded text-xs bg-${impactLevel?.color || 'gray'}-900 text-${impactLevel?.color || 'gray'}-300`}>
                          {impactLevel?.name || action.impact}
                        </span>
                        
                        {action.verified && (
                          <span className="flex items-center space-x-1 text-green-400">
                            <CheckCircle className="w-3 h-3" />
                            <span>Verified</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-400">+{action.pointsAwarded}</div>
                    <div className="text-xs text-gray-500">points</div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Add Action Modal */}
      <AnimatePresence>
        {showAddAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddAction(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-gray-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Log Real-World Action</h3>
                
                <form onSubmit={handleSubmitAction} className="space-y-6">
                  {/* Action Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Action Type
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {actionTypes.map((type) => {
                        const Icon = type.icon;
                        const isSelected = actionForm.type === type.id;
                        
                        return (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => setActionForm(prev => ({ ...prev, type: type.id, category: type.category }))}
                            className={`flex items-start space-x-3 p-3 rounded-lg border text-left transition-colors ${
                              isSelected 
                                ? `border-${type.color}-500 bg-${type.color}-900/20` 
                                : 'border-gray-700 hover:border-gray-600'
                            }`}
                          >
                            <Icon className={`w-5 h-5 mt-0.5 ${isSelected ? `text-${type.color}-400` : 'text-gray-400'}`} />
                            <div>
                              <div className={`font-medium ${isSelected ? `text-${type.color}-300` : 'text-white'}`}>
                                {type.name}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {type.basePoints} base points • {type.timeEstimate}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={actionForm.description}
                      onChange={(e) => setActionForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what you accomplished and its business context..."
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  {/* Impact Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Business Impact
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {impactLevels.map((level) => {
                        const isSelected = actionForm.impact === level.id;
                        
                        return (
                          <button
                            key={level.id}
                            type="button"
                            onClick={() => setActionForm(prev => ({ ...prev, impact: level.id }))}
                            className={`p-3 rounded-lg border text-left transition-colors ${
                              isSelected 
                                ? `border-${level.color}-500 bg-${level.color}-900/20` 
                                : 'border-gray-700 hover:border-gray-600'
                            }`}
                          >
                            <div className={`font-medium ${isSelected ? `text-${level.color}-300` : 'text-white'}`}>
                              {level.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {level.description} • {level.multiplier}x points
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Evidence (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Supporting Evidence (Optional)
                    </label>
                    <input
                      type="text"
                      value={actionForm.evidence}
                      onChange={(e) => setActionForm(prev => ({ ...prev, evidence: e.target.value }))}
                      placeholder="Link to proposal, meeting notes, etc."
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Honor System Notice */}
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-300 mb-1">Professional Honor System</h4>
                        <p className="text-blue-100 text-sm">
                          This system operates on professional integrity. Please accurately represent 
                          your business activities to maintain the value of your competency development.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowAddAction(false)}
                      className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    
                    <button
                      type="submit"
                      disabled={!actionForm.type || !actionForm.description}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors"
                    >
                      Log Action
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RealWorldActionTracker;