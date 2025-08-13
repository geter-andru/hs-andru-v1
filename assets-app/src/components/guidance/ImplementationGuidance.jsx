/**
 * ImplementationGuidance Component
 * 
 * Provides contextual "when/how/why" guidance directly into tool outputs
 * to bridge the gap between business intelligence and practical execution.
 * Frames guidance as "business execution methodology" not "sales tips".
 */

import React, { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { getGuidanceForTool } from '../../data/implementationGuidance';

const ImplementationGuidance = ({ toolType, context, customerData }) => {
  const guidance = getGuidanceForTool(toolType, context);
  
  return (
    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6 mt-6">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Lightbulb className="h-6 w-6 text-blue-400" />
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-blue-400 mb-4">
            Implementation Strategy
          </h4>
          
          <div className="grid md:grid-cols-3 gap-6">
            <GuidanceSection 
              title="WHEN TO USE"
              icon="⏰"
              content={guidance.when}
            />
            <GuidanceSection 
              title="HOW TO IMPLEMENT"
              icon="🎯"
              content={guidance.how}
            />
            <GuidanceSection 
              title="WHY THIS MATTERS"
              icon="💡"
              content={guidance.why}
            />
          </div>
          
          {guidance.conversationStarters && guidance.conversationStarters.length > 0 && (
            <div className="mt-6 pt-6 border-t border-blue-500/20">
              <ConversationStarters scenarios={guidance.conversationStarters} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const GuidanceSection = ({ title, icon, content }) => {
  return (
    <div>
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-lg">{icon}</span>
        <h5 className="text-sm font-semibold text-blue-300">{title}</h5>
      </div>
      <div className="space-y-2">
        {content.map((item, index) => (
          <p key={index} className="text-gray-300 text-sm">{item}</p>
        ))}
      </div>
    </div>
  );
};

const ConversationStarters = ({ scenarios }) => {
  const [activeScenario, setActiveScenario] = useState(0);
  
  return (
    <div>
      <h5 className="text-sm font-semibold text-blue-300 mb-3">
        🗣️ CONVERSATION FRAMEWORKS
      </h5>
      
      <div className="flex space-x-2 mb-4 overflow-x-auto scrollbar-hide">
        {scenarios.map((scenario, index) => (
          <button
            key={index}
            onClick={() => setActiveScenario(index)}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
              activeScenario === index
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {scenario.situation}
          </button>
        ))}
      </div>
      
      <div className="bg-gray-800/50 rounded-lg p-4">
        <p className="text-gray-200 text-sm font-medium mb-2">
          {scenarios[activeScenario].opener}
        </p>
        <ul className="space-y-1">
          {scenarios[activeScenario].followUp.map((line, index) => (
            <li key={index} className="text-gray-300 text-sm">
              • {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ImplementationGuidance;