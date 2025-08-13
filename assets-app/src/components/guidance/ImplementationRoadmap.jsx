/**
 * Implementation Roadmap Components
 * 
 * Visual roadmap showing the complete journey from discovery to optimization
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Calculator, FileText, TrendingUp, 
  ChevronRight, Clock, Target, Award,
  CheckCircle, Circle, Play, Users, 
  BarChart3, Lightbulb, Zap
} from 'lucide-react';

// Main Implementation Roadmap
export const ImplementationRoadmap = ({ roadmap, className = '' }) => {
  const [activePhase, setActivePhase] = useState(roadmap?.currentPhase || 'discovery');

  const phaseIcons = {
    discovery: Search,
    validation: Calculator,
    execution: FileText,
    optimization: TrendingUp
  };

  const phaseColors = {
    discovery: 'blue',
    validation: 'yellow',
    execution: 'green',
    optimization: 'purple'
  };

  if (!roadmap) return null;

  return (
    <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Implementation Roadmap</h3>
        {roadmap.estimatedCompletion && (
          <div className="text-right">
            <div className="text-sm text-gray-400">{roadmap.estimatedCompletion.message}</div>
          </div>
        )}
      </div>

      {/* Phase Timeline */}
      <div className="relative mb-8">
        <div className="flex items-center justify-between relative">
          {/* Connection Line */}
          <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-600 -z-10"></div>
          
          {roadmap.phases.map((phase, index) => {
            const Icon = phaseIcons[phase.title.toLowerCase().split(' ')[0]] || Target;
            const isActive = phase.title.toLowerCase().includes(activePhase);
            const isCompleted = phase.milestones.every(m => m.status === 'complete');
            const colorClass = phaseColors[phase.title.toLowerCase().split(' ')[0]] || 'gray';
            
            return (
              <motion.div
                key={index}
                className="relative flex flex-col items-center cursor-pointer"
                onClick={() => setActivePhase(phase.title.toLowerCase().split(' ')[0])}
                whileHover={{ scale: 1.05 }}
              >
                {/* Phase Circle */}
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center
                  ${isCompleted ? `bg-${colorClass}-500 border-${colorClass}-500` :
                    isActive ? `bg-${colorClass}-500/20 border-${colorClass}-500` :
                    'bg-gray-700 border-gray-600'}
                  transition-all duration-300`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <Icon className={`w-6 h-6 ${isActive ? `text-${colorClass}-400` : 'text-gray-400'}`} />
                  )}
                </div>
                
                {/* Phase Label */}
                <div className="mt-3 text-center">
                  <div className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>
                    {phase.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{phase.timeline}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Active Phase Details */}
      <AnimatePresence mode="wait">
        {roadmap.phases.map((phase, index) => {
          const isActive = phase.title.toLowerCase().includes(activePhase);
          if (!isActive) return null;

          return (
            <motion.div
              key={phase.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-white">{phase.title}</h4>
                <div className="text-sm text-gray-400">{phase.timeline}</div>
              </div>

              {/* Milestones */}
              <div className="space-y-3 mb-4">
                {phase.milestones.map((milestone, mIndex) => (
                  <div key={mIndex} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {milestone.status === 'complete' ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : milestone.status === 'in_progress' ? (
                        <Play className="w-5 h-5 text-yellow-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                    <span className={`text-sm ${
                      milestone.status === 'complete' ? 'text-green-400 line-through' : 'text-gray-300'
                    }`}>
                      {milestone.task}
                    </span>
                  </div>
                ))}
              </div>

              {/* Expected Outcome */}
              <div className="bg-gray-800 rounded p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-400">Expected Outcome</span>
                </div>
                <p className="text-sm text-gray-300">{phase.outcome}</p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Next Milestone */}
      {roadmap.nextMilestone && (
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">Next Milestone</span>
          </div>
          <div className="text-sm text-gray-300">
            <strong>{roadmap.nextMilestone.task}</strong> in {roadmap.nextMilestone.phase}
          </div>
          <div className="text-xs text-gray-400 mt-1">{roadmap.nextMilestone.timeline}</div>
        </div>
      )}
    </div>
  );
};

// Compact Journey Overview
export const JourneyOverview = ({ journeyMap, currentPhase, className = '' }) => {
  if (!journeyMap) return null;

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      <h4 className="text-white font-medium mb-3">Your Revenue Intelligence Journey</h4>
      
      <div className="space-y-3">
        {Object.entries(journeyMap).map(([key, phase], index) => {
          const isActive = key.toLowerCase() === currentPhase?.toLowerCase();
          const isCompleted = index < Object.keys(journeyMap).indexOf(currentPhase?.toLowerCase() || '');
          
          return (
            <div key={key} className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium
                ${isCompleted ? 'bg-green-500 border-green-500 text-white' :
                  isActive ? 'bg-blue-500 border-blue-500 text-white' :
                  'bg-gray-700 border-gray-600 text-gray-400'}`}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>
                  {phase.tool}
                </div>
                <div className="text-xs text-gray-500">{phase.purpose}</div>
              </div>
              
              {!isCompleted && index > 0 && (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Phase Success Metrics
export const PhaseMetrics = ({ phase, metrics, className = '' }) => {
  if (!metrics) return null;

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      <h4 className="text-white font-medium mb-3">{phase} Success Metrics</h4>
      
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key} className="text-center p-3 bg-gray-700 rounded">
            <div className="text-lg font-semibold text-blue-400">{value}</div>
            <div className="text-xs text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Implementation Timeline
export const ImplementationTimeline = ({ timeline, className = '' }) => {
  if (!timeline || !timeline.length) return null;

  return (
    <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">Implementation Timeline</h3>
      
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-gray-600"></div>
        
        <div className="space-y-6">
          {timeline.map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex items-start space-x-4"
            >
              {/* Timeline Dot */}
              <div className={`relative z-10 w-3 h-3 rounded-full mt-2
                ${event.completed ? 'bg-green-500' : 
                  event.current ? 'bg-blue-500' : 'bg-gray-500'}`}
              />
              
              {/* Event Content */}
              <div className="flex-1 min-w-0 pb-6">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`text-sm font-medium ${
                    event.completed ? 'text-green-400' : 
                    event.current ? 'text-blue-400' : 'text-gray-300'
                  }`}>
                    {event.title}
                  </h4>
                  <span className="text-xs text-gray-500">{event.timeframe}</span>
                </div>
                
                <p className="text-sm text-gray-400 mb-2">{event.description}</p>
                
                {event.deliverables && (
                  <div className="flex flex-wrap gap-1">
                    {event.deliverables.map((deliverable, dIndex) => (
                      <span key={dIndex} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                        {deliverable}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Quick Action Buttons
export const QuickActions = ({ actions, onActionClick, className = '' }) => {
  if (!actions || !actions.length) return null;

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      <h4 className="text-white font-medium mb-3">Quick Actions</h4>
      
      <div className="space-y-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => onActionClick?.(action)}
            className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white group-hover:text-blue-300">
                  {action.title}
                </div>
                <div className="text-xs text-gray-400">{action.description}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-300" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImplementationRoadmap;