/**
 * BuyerPersonaDetail Component - Displays comprehensive buyer persona information
 * 
 * Shows detailed persona characteristics including demographics, psychographics,
 * goals, pain points, buying behavior, and common objections.
 */

import React from 'react';
import { motion } from 'motion/react';

const PersonaSection = ({ title, data, icon }) => {
  if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
    return null;
  }

  const renderData = (data) => {
    if (typeof data === 'string') {
      return <p className="text-gray-300">{data}</p>;
    }
    
    if (Array.isArray(data)) {
      return (
        <ul className="space-y-1">
          {data.map((item, index) => (
            <li key={index} className="text-gray-300 flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              {item}
            </li>
          ))}
        </ul>
      );
    }
    
    if (typeof data === 'object') {
      return (
        <div className="space-y-2">
          {Object.entries(data).map(([key, value]) => (
            <div key={key}>
              <span className="text-blue-400 font-medium capitalize">
                {key.replace(/_/g, ' ')}: 
              </span>
              <span className="text-gray-300 ml-2">
                {Array.isArray(value) ? value.join(', ') : value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    
    return <p className="text-gray-300">{String(data)}</p>;
  };

  return (
    <motion.div
      className="bg-gray-700/50 rounded-lg p-4 border border-gray-600/50"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center mb-3">
        <span className="text-2xl mr-3">{icon}</span>
        <h4 className="text-lg font-semibold text-white">{title}</h4>
      </div>
      {renderData(data)}
    </motion.div>
  );
};

const BuyerPersonaDetail = ({ persona }) => {
  if (!persona) {
    return (
      <div className="mt-8 bg-gray-800 rounded-lg p-6">
        <h3 className="text-2xl font-bold text-white mb-4">
          Target Buyer Persona
        </h3>
        <p className="text-gray-400">
          No buyer persona data available. Complete your assessment to see detailed persona information.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="mt-8 bg-gray-800 rounded-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">
          Target Buyer Persona: {persona.name || 'Primary Decision Maker'}
        </h3>
        {persona.age && persona.occupation && (
          <p className="text-gray-300">
            {persona.age} years old • {persona.occupation}
          </p>
        )}
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <PersonaSection 
          title="Demographics" 
          data={persona.demographics}
          icon="👤"
        />
        <PersonaSection 
          title="Psychographics" 
          data={persona.psychographics}
          icon="🧠"
        />
        <PersonaSection 
          title="Goals & Motivations" 
          data={persona.goals_motivations}
          icon="🎯"
        />
        <PersonaSection 
          title="Pain Points" 
          data={persona.pain_points}
          icon="❌"
        />
        <PersonaSection 
          title="Buying Behavior" 
          data={persona.buying_behavior}
          icon="💳"
        />
        <PersonaSection 
          title="Technology Usage" 
          data={persona.technology_usage}
          icon="📱"
        />
      </div>
      
      {persona.information_sources && persona.information_sources.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
            <span className="text-2xl mr-3">📚</span>
            Information Sources
          </h4>
          <div className="flex flex-wrap gap-2">
            {persona.information_sources.map((source, index) => (
              <span
                key={index}
                className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-sm border border-blue-500/30"
              >
                {source}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {persona.communication_preferences && (
        <div className="mb-6">
          <PersonaSection 
            title="Communication Preferences" 
            data={persona.communication_preferences}
            icon="💬"
          />
        </div>
      )}
      
      {persona.objections_concerns && persona.objections_concerns.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
            <span className="text-2xl mr-3">⚠️</span>
            Common Objections & Concerns
          </h4>
          <ul className="space-y-2">
            {persona.objections_concerns.map((objection, index) => (
              <li key={index} className="text-gray-300 flex items-start">
                <span className="text-red-400 mr-2">•</span>
                {objection}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

export default BuyerPersonaDetail;