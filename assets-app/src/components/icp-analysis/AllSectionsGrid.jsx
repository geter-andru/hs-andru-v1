/**
 * AllSectionsGrid Component - Displays all ICP analysis sections in a grid layout
 * 
 * Renders all available ICP sections with proper HTML formatting and responsive design.
 */

import React from 'react';
import { motion } from 'motion/react';

const SectionCard = ({ title, htmlContent, index }) => {
  if (!htmlContent) return null;

  return (
    <motion.div
      className="icp-section-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <div className="bg-gray-800/50 rounded-lg border border-gray-600/50 overflow-hidden">
        <div className="bg-gray-700/50 px-4 py-3 border-b border-gray-600/50">
          <h3 className="text-lg font-semibold text-white capitalize">
            {title.replace(/_/g, ' ')}
          </h3>
        </div>
        <div className="p-4">
          <div 
            className="prose max-w-none prose-invert 
              [&>div]:!bg-gray-800/30 [&>div]:!border-gray-600/50 
              [&_h2]:!text-white [&_h3]:!text-gray-200 [&_h4]:!text-gray-300
              [&_p]:!text-gray-300 [&_ul]:!text-gray-300 [&_li]:!text-gray-300
              [&_.bg-white]:!bg-gray-800/30 [&_.bg-gray-50]:!bg-gray-700/30 
              [&_.text-blue-800]:!text-blue-400 [&_.text-blue-700]:!text-blue-300 
              [&_.text-gray-700]:!text-gray-300 [&_.text-gray-600]:!text-gray-400 
              [&_.text-gray-800]:!text-white [&_.text-gray-900]:!text-white
              [&_.bg-blue-50]:!bg-blue-900/20 [&_.border-blue-200]:!border-blue-600/50
              [&_.bg-red-50]:!bg-red-900/20 [&_.border-red-200]:!border-red-600/50 
              [&_.border-red-400]:!border-red-500/50 [&_.text-red-500]:!text-red-400
              [&_.bg-green-50]:!bg-green-900/20 [&_.border-green-200]:!border-green-600/50 
              [&_.border-green-400]:!border-green-500/50 [&_.text-green-500]:!text-green-400
              [&_.bg-yellow-50]:!bg-yellow-900/20 [&_.border-yellow-200]:!border-yellow-600/50 
              [&_.border-yellow-400]:!border-yellow-500/50 [&_.text-yellow-500]:!text-yellow-400
              [&_.shadow-md]:!shadow-lg [&_.shadow-md]:!shadow-black/20"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      </div>
    </motion.div>
  );
};

const AllSectionsGrid = ({ sections }) => {
  if (!sections || typeof sections !== 'object' || Object.keys(sections).length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No detailed sections available</p>
      </div>
    );
  }

  // Define section order for better UX flow
  const sectionOrder = [
    'firmographics',
    'technographics', 
    'budget_financial',
    'pain_points',
    'goals_objectives',
    'decision_making',
    'behavioral_characteristics',
    'value_drivers',
    'engagement_preferences',
    'current_solutions'
  ];

  // Sort sections by predefined order, then alphabetically for any extras
  const sortedSections = Object.entries(sections).sort(([a], [b]) => {
    const aIndex = sectionOrder.indexOf(a);
    const bIndex = sectionOrder.indexOf(b);
    
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">
          Complete ICP Analysis
        </h3>
        <p className="text-gray-400">
          Detailed breakdown of your ideal customer profile across all dimensions
        </p>
      </div>
      
      <div className="grid gap-6">
        {sortedSections.map(([key, htmlContent], index) => (
          <SectionCard
            key={key}
            title={key}
            htmlContent={htmlContent}
            index={index}
          />
        ))}
      </div>
      
      <motion.div
        className="mt-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="bg-blue-900/20 border border-blue-600/50 rounded-lg p-4">
          <p className="text-blue-300 text-sm">
            💡 <strong>Pro Tip:</strong> Use this comprehensive analysis to guide your prospect 
            conversations, marketing messaging, and sales qualification process.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AllSectionsGrid;