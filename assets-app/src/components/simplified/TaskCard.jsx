// TaskCard.jsx - Individual task component with completion tracking
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Clock, 
  Target, 
  BarChart3, 
  FileText, 
  ArrowRight,
  Lightbulb,
  Star,
  TrendingUp
} from 'lucide-react';

const TaskCard = ({ 
  task, 
  milestone, 
  customerId,
  onComplete, 
  actionable = true, 
  preview = false,
  className = ""
}) => {
  const navigate = useNavigate();
  const [completed, setCompleted] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Handle task completion with professional recognition
  const handleTaskCompletion = useCallback(async () => {
    if (isCompleting || completed) return;
    
    setIsCompleting(true);
    
    try {
      // Track task completion for usage assessment
      const completionData = {
        taskId: task.id,
        taskName: task.name,
        milestone: milestone.tier,
        competencyArea: task.competencyArea,
        priority: task.priority,
        completionTime: Date.now(),
        toolUsed: task.platformConnection?.tool || 'none',
        competencyGain: getCompetencyGain(task.priority),
        notes: `Completed via simplified platform - ${milestone.tier} stage`
      };
      
      // Update local state immediately
      setCompleted(true);
      
      // Show professional recognition
      showTaskCompletionRecognition(task, completionData);
      
      // Call parent handler
      if (onComplete) {
        await onComplete(task, completionData);
      }
      
    } catch (error) {
      console.error('Error completing task:', error);
      setCompleted(false);
    } finally {
      setIsCompleting(false);
    }
  }, [task, milestone, onComplete, isCompleting, completed]);

  // Navigate to platform tool if task has connection
  const handleToolNavigation = useCallback(() => {
    if (!task.platformConnection) return;
    
    const toolUrls = {
      'icp': `/customer/${customerId}/simplified/icp`,
      'financial': `/customer/${customerId}/simplified/financial`,
      'resources': `/customer/${customerId}/simplified/resources`
    };
    
    const url = toolUrls[task.platformConnection.tool];
    if (url) {
      navigate(url);
    }
  }, [task.platformConnection, customerId, navigate]);

  // Get competency gain based on priority
  const getCompetencyGain = (priority) => {
    const gains = { critical: 8, high: 5, medium: 3, low: 1 };
    return gains[priority] || 1;
  };

  // Show professional task completion recognition
  const showTaskCompletionRecognition = (task, completionData) => {
    const recognition = {
      message: `${task.name} implementation complete`,
      competencyGain: `${task.competencyArea} capability enhanced (+${completionData.competencyGain} points)`,
      businessImpact: getBusinessImpactMessage(task),
      nextSuggestion: getNextActionSuggestion(task)
    };
    
    // Simple console log for now - in production would show elegant notification
    console.log('🎯 Professional Recognition:', recognition);
    
    // Could trigger toast notification or modal here
    // showProfessionalNotification(recognition);
  };

  // Get business impact message for task
  const getBusinessImpactMessage = (task) => {
    const impactMessages = {
      'customerAnalysis': 'Enhanced buyer understanding drives more effective targeting',
      'valueCommunication': 'Improved value articulation accelerates deal closure',
      'executiveReadiness': 'Strengthened executive capabilities enable scaling',
      'general': 'Systematic business development progress achieved'
    };
    
    return impactMessages[task.competencyArea] || impactMessages.general;
  };

  // Get next action suggestion
  const getNextActionSuggestion = (task) => {
    if (task.platformConnection) {
      return `Use ${task.platformConnection.toolName} to implement: ${task.platformConnection.action}`;
    }
    
    return 'Continue with next recommended action for systematic progress';
  };

  // Get priority styling
  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'bg-red-600 text-white',
      high: 'bg-orange-600 text-white', 
      medium: 'bg-yellow-600 text-white',
      low: 'bg-gray-600 text-white'
    };
    return colors[priority] || colors.medium;
  };

  // Get competency area styling
  const getCompetencyColor = (competencyArea) => {
    const colors = {
      customerAnalysis: 'bg-blue-900/30 text-blue-400 border-blue-800',
      valueCommunication: 'bg-green-900/30 text-green-400 border-green-800',
      executiveReadiness: 'bg-purple-900/30 text-purple-400 border-purple-800',
      general: 'bg-gray-900/30 text-gray-400 border-gray-800'
    };
    return colors[competencyArea] || colors.general;
  };

  // Get platform tool icon
  const getToolIcon = (toolName) => {
    const icons = {
      'icp': Target,
      'financial': BarChart3,
      'resources': FileText
    };
    return icons[toolName] || Target;
  };

  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 transition-all duration-200 ${
      preview ? 'opacity-60' : 
      completed ? 'opacity-75 border-green-800' : 
      'hover:border-gray-600 hover:shadow-lg'
    } ${className}`}>
      
      {/* Task Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className={`font-medium mb-2 leading-tight ${
              completed ? 'line-through text-gray-500' : 'text-white'
            }`}>
              {task.name}
            </h4>
            
            {/* Task metadata */}
            <div className="flex items-center flex-wrap gap-2 mb-2">
              {task.priority && (
                <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              )}
              
              <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                {task.stageMilestone || task.category}
              </span>
              
              {task.competencyArea && task.competencyArea !== 'general' && (
                <span className={`text-xs px-2 py-1 rounded border ${getCompetencyColor(task.competencyArea)}`}>
                  {task.competencyArea}
                </span>
              )}
              
              {task.estimatedTime && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {task.estimatedTime}
                </div>
              )}
            </div>
          </div>
          
          {/* Priority indicator */}
          {task.priority === 'critical' && !completed && (
            <div className="ml-2">
              <Star className="w-4 h-4 text-yellow-400" />
            </div>
          )}
        </div>

        {/* Platform connection hint */}
        {task.platformConnection && !completed && (
          <div className="mb-3 p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-400 font-medium mb-1">
                  Platform Integration Available
                </p>
                <p className="text-xs text-blue-300">
                  {task.platformConnection.connection}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Task description if available */}
        {task.description && (
          <p className="text-sm text-gray-400 mb-3 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Revenue context */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <TrendingUp className="w-3 h-3" />
          <span>{milestone.revenueRange} stage</span>
          {task.competencyGap > 0 && (
            <>
              <span>•</span>
              <span>{task.competencyGap} point gap</span>
            </>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {actionable && !completed && !preview && (
            <>
              <button 
                onClick={handleTaskCompletion}
                disabled={isCompleting}
                className="flex-1 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium"
              >
                {isCompleting ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Mark Complete
                  </>
                )}
              </button>
              
              {task.platformConnection && (
                <button
                  onClick={handleToolNavigation}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center"
                  title={`Use ${task.platformConnection.toolName}`}
                >
                  {React.createElement(getToolIcon(task.platformConnection.tool), { className: "w-4 h-4" })}
                </button>
              )}
            </>
          )}
          
          {completed && (
            <div className="flex-1 py-2 text-center">
              <span className="text-sm text-green-400 bg-green-900/30 px-4 py-2 rounded-lg flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Implementation Complete
              </span>
            </div>
          )}
          
          {preview && (
            <div className="flex-1 py-2 text-center">
              <span className="text-sm text-gray-500 bg-gray-700/50 px-4 py-2 rounded-lg flex items-center justify-center gap-2">
                <ArrowRight className="w-4 h-4" />
                Available at Next Stage
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;