/**
 * Progress Sidebar Component
 * 
 * Professional competency tracking sidebar with assessment baseline comparison
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, TrendingUp, Target, Clock, CheckCircle, 
  BarChart3, Star, ArrowUp, Plus, Calendar,
  User, Trophy, Zap
} from 'lucide-react';

const ProgressSidebar = ({ 
  competencyData, 
  onAwardPoints, 
  className = '' 
}) => {
  const [expandedSection, setExpandedSection] = useState('competency');

  // Professional level configuration
  const levelConfig = {
    'Customer Intelligence Foundation': { 
      points: 1000, 
      color: 'blue', 
      icon: Target,
      description: 'Building customer analysis foundation'
    },
    'Value Communication Developing': { 
      points: 2500, 
      color: 'green', 
      icon: TrendingUp,
      description: 'Developing value articulation skills'
    },
    'Sales Strategy Proficient': { 
      points: 5000, 
      color: 'purple', 
      icon: BarChart3,
      description: 'Proficient in strategic sales execution'
    },
    'Revenue Development Advanced': { 
      points: 10000, 
      color: 'yellow', 
      icon: Star,
      description: 'Advanced revenue development capabilities'
    },
    'Market Execution Expert': { 
      points: 20000, 
      color: 'orange', 
      icon: Trophy,
      description: 'Expert-level market execution'
    },
    'Revenue Intelligence Master': { 
      points: 50000, 
      color: 'red', 
      icon: Award,
      description: 'Master of revenue intelligence'
    }
  };

  // Real-world actions for honor system tracking
  const realWorldActions = [
    {
      id: 'target_account_list',
      title: 'Create Target Account List',
      description: '50+ companies matching ICP criteria',
      points: 100,
      category: 'customerAnalysis',
      timeEstimate: '2 hours',
      completed: false
    },
    {
      id: 'buyer_conversations',
      title: 'Document Buyer Conversations',
      description: '3 interviews with target customers',
      points: 150,
      category: 'customerAnalysis',
      timeEstimate: '3 hours',
      completed: false
    },
    {
      id: 'value_proposition_deck',
      title: 'Create Value Proposition Deck',
      description: 'Professional presentation materials',
      points: 200,
      category: 'valueCommunication',
      timeEstimate: '4 hours',
      completed: false
    },
    {
      id: 'tier1_demo_scheduled',
      title: 'Schedule Tier 1 Demo',
      description: 'High-value prospect demonstration',
      points: 300,
      category: 'salesExecution',
      timeEstimate: '1 hour',
      completed: false
    },
    {
      id: 'linkedin_outreach',
      title: 'LinkedIn Outreach Campaign',
      description: '10+ strategic connections made',
      points: 75,
      category: 'salesExecution',
      timeEstimate: '2 hours',
      completed: false
    }
  ];

  // Calculate improvement from baseline
  const getImprovement = (current, baseline) => {
    return current - baseline;
  };

  // Get progress to next level
  const getNextLevelProgress = () => {
    const levels = Object.keys(levelConfig);
    const currentIndex = levels.indexOf(competencyData.currentLevel);
    
    if (currentIndex === -1 || currentIndex === levels.length - 1) {
      return { nextLevel: 'Maximum Level', pointsNeeded: 0, progress: 100 };
    }
    
    const nextLevel = levels[currentIndex + 1];
    const nextLevelPoints = levelConfig[nextLevel].points;
    const pointsNeeded = nextLevelPoints - competencyData.totalProgressPoints;
    const progress = (competencyData.totalProgressPoints / nextLevelPoints) * 100;
    
    return { nextLevel, pointsNeeded, progress: Math.min(100, progress) };
  };

  // Handle real-world action completion
  const handleActionComplete = (actionId) => {
    const action = realWorldActions.find(a => a.id === actionId);
    if (action && !action.completed) {
      action.completed = true;
      onAwardPoints(action.points, action.category);
    }
  };

  const nextLevelInfo = getNextLevelProgress();
  const currentLevelConfig = levelConfig[competencyData.currentLevel] || levelConfig['Customer Intelligence Foundation'];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Competency Badge */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 border border-gray-800 rounded-lg p-6"
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <currentLevelConfig.icon className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="font-semibold text-white mb-2">
            {competencyData.currentLevel}
          </h3>
          
          <p className="text-sm text-gray-400 mb-4">
            {currentLevelConfig.description}
          </p>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {competencyData.totalProgressPoints.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">Progress Points</div>
          </div>
        </div>
      </motion.div>

      {/* Progress Bars - Assessment vs Current */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-900 border border-gray-800 rounded-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-white">Progress Since Assessment</h4>
          <BarChart3 className="w-5 h-5 text-blue-400" />
        </div>
        
        <div className="space-y-4">
          {/* Customer Analysis */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-300">Customer Analysis</span>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">
                  {competencyData.baselineCustomerAnalysis}
                </span>
                <ArrowUp className="w-3 h-3 text-green-400" />
                <span className="text-green-400 font-medium">
                  {competencyData.currentCustomerAnalysis.toFixed(0)}
                </span>
                <span className="text-xs text-green-400">
                  (+{getImprovement(competencyData.currentCustomerAnalysis, competencyData.baselineCustomerAnalysis).toFixed(0)})
                </span>
              </div>
            </div>
            
            <div className="relative">
              <div className="w-full bg-gray-800 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${competencyData.currentCustomerAnalysis}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-blue-500 h-2 rounded-full"
                />
              </div>
              {/* Baseline marker */}
              <div 
                className="absolute top-0 w-0.5 h-2 bg-gray-500"
                style={{ left: `${competencyData.baselineCustomerAnalysis}%` }}
              />
            </div>
          </div>

          {/* Value Communication */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-300">Value Communication</span>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">
                  {competencyData.baselineValueCommunication}
                </span>
                <ArrowUp className="w-3 h-3 text-green-400" />
                <span className="text-green-400 font-medium">
                  {competencyData.currentValueCommunication.toFixed(0)}
                </span>
                <span className="text-xs text-green-400">
                  (+{getImprovement(competencyData.currentValueCommunication, competencyData.baselineValueCommunication).toFixed(0)})
                </span>
              </div>
            </div>
            
            <div className="relative">
              <div className="w-full bg-gray-800 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${competencyData.currentValueCommunication}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                  className="bg-green-500 h-2 rounded-full"
                />
              </div>
              <div 
                className="absolute top-0 w-0.5 h-2 bg-gray-500"
                style={{ left: `${competencyData.baselineValueCommunication}%` }}
              />
            </div>
          </div>

          {/* Sales Execution */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-300">Sales Execution</span>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">
                  {competencyData.baselineSalesExecution}
                </span>
                <ArrowUp className="w-3 h-3 text-green-400" />
                <span className="text-green-400 font-medium">
                  {competencyData.currentSalesExecution.toFixed(0)}
                </span>
                <span className="text-xs text-green-400">
                  (+{getImprovement(competencyData.currentSalesExecution, competencyData.baselineSalesExecution).toFixed(0)})
                </span>
              </div>
            </div>
            
            <div className="relative">
              <div className="w-full bg-gray-800 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${competencyData.currentSalesExecution}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                  className="bg-purple-500 h-2 rounded-full"
                />
              </div>
              <div 
                className="absolute top-0 w-0.5 h-2 bg-gray-500"
                style={{ left: `${competencyData.baselineSalesExecution}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Level Advancement Preview */}
      {nextLevelInfo.pointsNeeded > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900 border border-gray-800 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-white">Next Professional Level</h4>
            <Trophy className="w-5 h-5 text-yellow-400" />
          </div>
          
          <div className="text-center mb-4">
            <div className="text-lg font-medium text-yellow-400 mb-1">
              {nextLevelInfo.nextLevel}
            </div>
            <div className="text-sm text-gray-400">
              {nextLevelInfo.pointsNeeded.toLocaleString()} points needed
            </div>
          </div>
          
          <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${nextLevelInfo.progress}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
              className="bg-yellow-500 h-2 rounded-full"
            />
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            {nextLevelInfo.progress.toFixed(0)}% Complete
          </div>
        </motion.div>
      )}

      {/* Real-World Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-900 border border-gray-800 rounded-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-white">Real-World Actions</h4>
          <Zap className="w-5 h-5 text-purple-400" />
        </div>
        
        <div className="space-y-3">
          {realWorldActions.slice(0, 3).map((action) => (
            <div key={action.id} className="border border-gray-700 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h5 className="text-sm font-medium text-white mb-1">
                    {action.title}
                  </h5>
                  <p className="text-xs text-gray-400 mb-2">
                    {action.description}
                  </p>
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{action.timeEstimate}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Plus className="w-3 h-3" />
                      <span>{action.points} points</span>
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleActionComplete(action.id)}
                  disabled={action.completed}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    action.completed 
                      ? 'bg-green-900 text-green-400 cursor-not-allowed'
                      : 'bg-blue-900 text-blue-300 hover:bg-blue-800'
                  }`}
                >
                  {action.completed ? 'Complete' : 'Mark Done'}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            View All Actions →
          </button>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-900 border border-gray-800 rounded-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-white">Today's Progress</h4>
          <Calendar className="w-5 h-5 text-green-400" />
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <div className="flex-1">
              <div className="text-sm text-gray-300">Platform Engagement</div>
              <div className="text-xs text-gray-500">+25 points</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <div className="flex-1">
              <div className="text-sm text-gray-300">Content Interaction</div>
              <div className="text-xs text-gray-500">+15 points</div>
            </div>
          </div>
          
          <div className="text-center pt-2 border-t border-gray-700">
            <div className="text-lg font-medium text-white">40</div>
            <div className="text-xs text-gray-500">Points earned today</div>
          </div>
        </div>
      </motion.div>

      {/* Test Action Buttons */}
      {onAwardPoints && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-900 border border-gray-800 rounded-lg p-4"
        >
          <h4 className="text-white font-medium mb-3 text-center">Test Actions</h4>
          <div className="space-y-2">
            <button
              onClick={() => onAwardPoints(50, 'customerAnalysis')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded transition-colors"
            >
              Award 50 Points (Customer Analysis)
            </button>
            <button
              onClick={() => onAwardPoints(75, 'valueCommunication')}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-3 rounded transition-colors"
            >
              Award 75 Points (Value Communication)
            </button>
            <button
              onClick={() => onAwardPoints(100, 'salesExecution')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 px-3 rounded transition-colors"
            >
              Award 100 Points (Sales Execution)
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProgressSidebar;