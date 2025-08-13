/**
 * ExportStrategyGuide Component
 * 
 * Provides stakeholder-specific export strategies to help technical founders
 * present their business intelligence effectively to different audiences.
 */

import React, { useState } from 'react';

const ExportStrategyGuide = ({ results, stakeholderTypes, onExport }) => {
  const [selectedStakeholder, setSelectedStakeholder] = useState(stakeholderTypes[0]);
  
  const getStakeholderStrategy = (stakeholder) => {
    const strategies = {
      "CEO": {
        focus: "Strategic impact and competitive advantage",
        keyMetrics: ["Total business impact", "Market opportunity", "Growth acceleration"],
        timing: "Include in quarterly business reviews or strategic planning sessions",
        format: "Executive summary with visual timeline",
        emailTemplate: "Subject: Strategic Initiative - [Company] Growth Acceleration\n\nDear [CEO Name],\n\nI've prepared an analysis showing how our solution aligns with your strategic growth objectives..."
      },
      "CFO": {
        focus: "Financial justification and ROI analysis",
        keyMetrics: ["Cost of delay", "ROI timeline", "Budget allocation"],
        timing: "Present during budget planning or financial review cycles",
        format: "Detailed financial analysis with month-by-month projections",
        emailTemplate: "Subject: Financial Impact Analysis - [Initiative Name]\n\nDear [CFO Name],\n\nAttached is a comprehensive financial analysis demonstrating the ROI and cost implications..."
      },
      "VP Sales": {
        focus: "Revenue impact and team performance",
        keyMetrics: ["Pipeline acceleration", "Close rate improvement", "Quota achievement"],
        timing: "Sales team meetings and performance reviews",
        format: "Sales impact presentation with team training elements",
        emailTemplate: "Subject: Sales Performance Enhancement Opportunity\n\nDear [VP Sales Name],\n\nI've analyzed how our solution can directly impact your team's performance metrics..."
      },
      "CTO": {
        focus: "Technical architecture and implementation efficiency",
        keyMetrics: ["Development velocity", "Technical debt reduction", "System scalability"],
        timing: "Technical planning sessions or architecture reviews",
        format: "Technical specifications with implementation roadmap",
        emailTemplate: "Subject: Technical Evaluation - [Solution Name]\n\nDear [CTO Name],\n\nHere's a technical assessment of how our solution integrates with your existing architecture..."
      },
      "VP Product": {
        focus: "Product capability enhancement and user experience",
        keyMetrics: ["Feature velocity", "User satisfaction", "Market differentiation"],
        timing: "Product roadmap planning or feature prioritization sessions",
        format: "Product impact analysis with user journey mapping",
        emailTemplate: "Subject: Product Enhancement Opportunity Analysis\n\nDear [VP Product Name],\n\nI've prepared an analysis of how our solution enhances your product capabilities..."
      }
    };
    
    return strategies[stakeholder] || strategies["CEO"];
  };

  const strategy = getStakeholderStrategy(selectedStakeholder);

  const handleExport = () => {
    if (onExport) {
      onExport(selectedStakeholder, strategy);
    }
  };

  const handleGenerateEmail = () => {
    // Copy email template to clipboard
    navigator.clipboard.writeText(strategy.emailTemplate);
    // You could also trigger a notification here
  };

  return (
    <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6 mt-6">
      <h4 className="text-lg font-semibold text-purple-400 mb-4">
        📋 Stakeholder Export Strategy
      </h4>
      
      <div className="flex space-x-2 mb-6 overflow-x-auto scrollbar-hide">
        {stakeholderTypes.map((stakeholder) => (
          <button
            key={stakeholder}
            onClick={() => setSelectedStakeholder(stakeholder)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              selectedStakeholder === stakeholder
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {stakeholder}
          </button>
        ))}
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h5 className="text-sm font-semibold text-purple-300 mb-3">
            🎯 PRESENTATION FOCUS
          </h5>
          <p className="text-gray-300 text-sm mb-4">{strategy.focus}</p>
          
          <h5 className="text-sm font-semibold text-purple-300 mb-3">
            📊 KEY METRICS TO HIGHLIGHT
          </h5>
          <ul className="space-y-1">
            {strategy.keyMetrics.map((metric, index) => (
              <li key={index} className="text-gray-300 text-sm">• {metric}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h5 className="text-sm font-semibold text-purple-300 mb-3">
            ⏰ OPTIMAL TIMING
          </h5>
          <p className="text-gray-300 text-sm mb-4">{strategy.timing}</p>
          
          <h5 className="text-sm font-semibold text-purple-300 mb-3">
            📄 RECOMMENDED FORMAT
          </h5>
          <p className="text-gray-300 text-sm">{strategy.format}</p>
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t border-purple-500/20">
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={handleExport}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Export for {selectedStakeholder}
          </button>
          <button 
            onClick={handleGenerateEmail}
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Copy Email Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportStrategyGuide;