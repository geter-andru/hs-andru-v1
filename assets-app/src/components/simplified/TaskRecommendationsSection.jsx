// TaskRecommendationsSection.jsx - Task recommendations for SimplifiedDashboard
import React, { useState, useEffect, useCallback } from 'react';
import { Target, TrendingUp, AlertCircle, CheckCircle, Lightbulb, ArrowRight } from 'lucide-react';
import TaskCard from './TaskCard';
import { TaskDataService } from '../../services/TaskDataService';
import { TaskRecommendationEngine } from '../../services/TaskRecommendationEngine';
import { TaskCacheManager } from '../../services/TaskCacheManager';

const TaskRecommendationsSection = ({ 
  customerData, 
  usageAssessment, 
  customerId,
  onTaskComplete 
}) => {
  const [currentTasks, setCurrentTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);

  // Enhanced task completion handler
  const handleTaskComplete = useCallback(async (task, completionData) => {
    try {
      // Update completed count
      setCompletedTasksCount(prev => prev + 1);
      
      // Save to Airtable (non-blocking)
      TaskDataService.saveTaskProgress(customerId, task, completionData).catch(error => {
        console.warn('Failed to save task progress to Airtable:', error);
      });
      
      // Update competency scores locally
      updateCompetencyProgress(task.competencyArea, completionData.competencyGain);
      
      // Call parent handler
      if (onTaskComplete) {
        onTaskComplete(task, completionData);
      }
      
      // Show professional recognition
      showProfessionalRecognition(task, completionData);
      
    } catch (error) {
      console.error('Error handling task completion:', error);
    }
  }, [customerId, onTaskComplete]);

  // Fetch task recommendations with performance optimization
  const fetchTaskRecommendations = useCallback(async () => {
    if (!customerData?.milestone) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Preload critical data for better performance
      if (customerId && customerData.milestone && customerData.competencyScores) {
        TaskDataService.preloadDashboardData(
          customerId, 
          customerData.milestone, 
          customerData.competencyScores
        ).catch(error => console.warn('Preload failed:', error));
      }
      
      // Fetch current milestone tasks (will use cache if available)
      const customerDataWithId = { ...customerData, customerId };
      const tasks = await TaskDataService.fetchTasksForCustomer(customerDataWithId, usageAssessment);
      setCurrentTasks(tasks);
      
      // Fetch upcoming milestone preview (2 tasks, cached)
      const nextMilestone = TaskRecommendationEngine.getNextMilestone(customerData.milestone);
      if (nextMilestone) {
        const upcomingTasksData = await TaskDataService.fetchUpcomingTasks(
          customerData.milestone,
          customerData.competencyScores || {}
        );
        setUpcomingTasks(upcomingTasksData);
      }
      
    } catch (error) {
      console.error('Error fetching task recommendations:', error);
      setError(error.message);
      
      // Graceful degradation with default tasks
      const defaultTasks = TaskRecommendationEngine.getDefaultTasksForMilestone(
        customerData.milestone.tier
      ).map(task => ({
        ...task,
        competencyArea: TaskRecommendationEngine.mapTaskToCompetency(task.name),
        platformConnection: TaskRecommendationEngine.getToolRecommendation(task.name),
        competencyGap: calculateCompetencyGap(task, customerData)
      }));
      
      setCurrentTasks(defaultTasks);
      
    } finally {
      setLoading(false);
    }
  }, [customerData, usageAssessment, customerId]);

  // Calculate competency gap for task
  const calculateCompetencyGap = (task, customerData) => {
    const competencyArea = task.competencyArea;
    if (competencyArea === 'general') return 0;
    
    const currentScore = customerData.competencyScores?.[competencyArea] || 50;
    const targetScore = customerData.milestone?.targets?.[competencyArea] || 70;
    
    return Math.max(0, targetScore - currentScore);
  };

  // Update competency progress (mock implementation)
  const updateCompetencyProgress = (competencyArea, gain) => {
    // In production, this would update the actual competency scores
    console.log(`Competency Progress: ${competencyArea} +${gain} points`);
  };

  // Show professional recognition
  const showProfessionalRecognition = (task, completionData) => {
    const messages = {
      customerAnalysis: 'Customer intelligence capability strengthened',
      valueCommunication: 'Value articulation proficiency enhanced', 
      executiveReadiness: 'Executive leadership capacity improved',
      general: 'Business development progress achieved'
    };
    
    const message = messages[task.competencyArea] || messages.general;
    
    // Could trigger notification system here
    console.log(`🎯 ${message} (+${completionData.competencyGain} points)`);
  };

  // Initial fetch and cache cleanup setup
  useEffect(() => {
    fetchTaskRecommendations();
    
    // Start background cache cleanup
    const cleanupCache = TaskCacheManager.startBackgroundCleanup();
    
    // Cleanup on unmount
    return () => {
      if (cleanupCache) cleanupCache();
    };
  }, [fetchTaskRecommendations]);

  // Loading state
  if (loading) {
    return (
      <div className="task-recommendations-section">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white mb-1">
            Recommended Next Actions
          </h3>
          <p className="text-sm text-gray-400">Loading personalized recommendations...</p>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-800 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state with fallback
  if (error && currentTasks.length === 0) {
    return (
      <div className="task-recommendations-section">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white mb-1">
            Recommended Next Actions
          </h3>
          <div className="flex items-center gap-2 text-sm text-yellow-400">
            <AlertCircle className="w-4 h-4" />
            Using offline recommendations (connection issue)
          </div>
        </div>
        <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-400 text-sm">
            Unable to fetch live recommendations. Showing default tasks for your milestone stage.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="task-recommendations-section space-y-6">
      
      {/* Current milestone tasks */}
      <div className="current-tasks">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white">
              Recommended Next Actions
            </h3>
            {completedTasksCount > 0 && (
              <div className="flex items-center gap-2 text-sm text-green-400">
                <CheckCircle className="w-4 h-4" />
                {completedTasksCount} completed today
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
            <Target className="w-4 h-4" />
            <span>{customerData.milestone.context}</span>
            <span>•</span>
            <span className="text-blue-400">{customerData.milestone.revenueRange}</span>
          </div>
          
          {/* Milestone progress indicator */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Current Stage:</span>
              <span className="text-white font-medium capitalize">
                {customerData.milestone.tier} Building
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-400">Focus Areas:</span>
              <span className="text-blue-400">
                {customerData.milestone.priority?.slice(0, 2).join(', ') || 'Business Development'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Task cards */}
        <div className="space-y-3">
          {currentTasks.length > 0 ? (
            currentTasks.map(task => (
              <TaskCard 
                key={task.id}
                task={task}
                milestone={customerData.milestone}
                customerId={customerId}
                onComplete={handleTaskComplete}
                actionable={true}
              />
            ))
          ) : (
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-white font-medium mb-1">All current tasks completed!</p>
              <p className="text-gray-400 text-sm">
                Excellent progress on your {customerData.milestone.tier} stage development.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming milestone preview */}
      {upcomingTasks.length > 0 && (
        <div className="upcoming-tasks">
          <div className="mb-4">
            <h3 className="text-base font-medium text-gray-300 mb-1 flex items-center gap-2">
              <ArrowRight className="w-4 h-4" />
              Coming Up Next
            </h3>
            <p className="text-sm text-gray-500">
              Advanced capabilities as you progress to the next revenue stage
            </p>
          </div>
          
          <div className="space-y-3">
            {upcomingTasks.map(task => (
              <TaskCard 
                key={`upcoming-${task.id}`}
                task={task}
                milestone={customerData.milestone}
                customerId={customerId}
                onComplete={null}
                actionable={false}
                preview={true}
              />
            ))}
          </div>
          
          {/* Next milestone info */}
          <div className="mt-4 bg-blue-900/20 border border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <p className="text-blue-400 font-medium mb-1">Next Milestone Preview</p>
                <p className="text-blue-300 text-sm">
                  Continue building your {customerData.milestone.tier} stage capabilities to unlock advanced features and higher-revenue stage tasks.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task completion insights */}
      {completedTasksCount > 0 && (
        <div className="completion-insights">
          <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-green-400 mt-0.5" />
              <div>
                <p className="text-green-400 font-medium mb-1">Implementation Progress</p>
                <p className="text-green-300 text-sm">
                  {completedTasksCount} task{completedTasksCount > 1 ? 's' : ''} completed today. 
                  Your systematic approach to business development is building valuable capabilities 
                  for sustainable growth.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskRecommendationsSection;