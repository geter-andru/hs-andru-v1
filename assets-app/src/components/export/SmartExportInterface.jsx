// SmartExportInterface.jsx - Intelligent export interface for AI, CRM, and Sales Automation platforms

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExportEngineService } from '../../services/ExportEngineService';
import { AIIntegrationTemplates } from '../../services/AIIntegrationTemplates';
import { CRMIntegrationService } from '../../services/CRMIntegrationService';
import { SalesAutomationService } from '../../services/SalesAutomationService';
import LoadingSpinner from '../common/LoadingSpinner';
import { Callout } from '../common/ContentDisplay';

const SmartExportInterface = ({
  sourceData,
  contentType = 'icp-analysis',
  userTools = [],
  onExport = () => {},
  className = ''
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [selectedFormats, setSelectedFormats] = useState(new Set());
  const [activeCategory, setActiveCategory] = useState('ai_tools');
  const [exportData, setExportData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewContent, setPreviewContent] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Get smart recommendations on mount
  useEffect(() => {
    if (sourceData && contentType) {
      try {
        const smartRecommendations = ExportEngineService.recommendExportFormats(userTools, contentType);
        setRecommendations(smartRecommendations);
        
        // Auto-select top 3 recommendations
        if (smartRecommendations.length > 0) {
          setSelectedFormats(new Set(smartRecommendations.slice(0, 3)));
        }
      } catch (err) {
        console.error('Error getting export recommendations:', err);
        setError('Failed to generate export recommendations');
      }
    }
  }, [sourceData, contentType, userTools]);

  // Generate export data when selections change
  useEffect(() => {
    if (selectedFormats.size > 0 && sourceData) {
      generateExportData();
    }
  }, [selectedFormats, sourceData]);

  const generateExportData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const newExportData = {};
      
      for (const formatId of selectedFormats) {
        const formatInfo = ExportEngineService.getExportFormatInfo(formatId);
        
        switch (formatInfo.category) {
          case 'ai_tools':
            newExportData[formatId] = await generateAIExports(formatId);
            break;
          case 'crm_platforms':
            newExportData[formatId] = await generateCRMExports(formatId);
            break;
          case 'sales_automation':
            newExportData[formatId] = await generateSalesAutomationExports(formatId);
            break;
          default:
            newExportData[formatId] = { content: 'Export format not yet implemented' };
        }
      }
      
      setExportData(newExportData);
    } catch (err) {
      console.error('Error generating export data:', err);
      setError('Failed to generate export data');
    } finally {
      setLoading(false);
    }
  };

  const generateAIExports = async (formatId) => {
    switch (formatId) {
      case 'claude_prompts':
        return AIIntegrationTemplates.generateClaudePrompts(
          sourceData.icpData,
          sourceData.costData,
          sourceData.businessCaseData
        );
      case 'persona_briefs':
        return AIIntegrationTemplates.generateAIPersonas(sourceData.icpData);
      case 'conversation_scripts':
        return AIIntegrationTemplates.generateConversationScripts(
          sourceData.icpData,
          sourceData.businessCaseData
        );
      default:
        return { content: 'AI export format not implemented' };
    }
  };

  const generateCRMExports = async (formatId) => {
    switch (formatId) {
      case 'hubspot_properties':
        return CRMIntegrationService.generateHubSpotProperties(
          sourceData.icpData,
          sourceData.assessmentData
        );
      case 'salesforce_fields':
        return CRMIntegrationService.generateSalesforceFields(
          sourceData.icpData,
          sourceData.costData
        );
      case 'pipedrive_data':
        return CRMIntegrationService.generatePipedriveData(
          sourceData.icpData,
          sourceData.assessmentData
        );
      default:
        return { content: 'CRM export format not implemented' };
    }
  };

  const generateSalesAutomationExports = async (formatId) => {
    switch (formatId) {
      case 'outreach_sequences':
        return SalesAutomationService.generateOutreachSequences(
          sourceData.icpData,
          sourceData.businessCaseData
        );
      case 'salesloft_cadences':
        return SalesAutomationService.generateSalesLoftCadences(
          sourceData.icpData,
          sourceData.costData
        );
      case 'apollo_lists':
        return SalesAutomationService.generateApolloLists(
          sourceData.icpData,
          sourceData.assessmentData
        );
      default:
        return { content: 'Sales automation export format not implemented' };
    }
  };

  const handleFormatToggle = (formatId) => {
    const newSelected = new Set(selectedFormats);
    if (newSelected.has(formatId)) {
      newSelected.delete(formatId);
    } else {
      newSelected.add(formatId);
    }
    setSelectedFormats(newSelected);
  };

  const handlePreview = (formatId) => {
    if (exportData[formatId]) {
      setPreviewContent({ formatId, data: exportData[formatId] });
      setShowPreview(true);
    }
  };

  const handleExport = async () => {
    if (selectedFormats.size === 0) {
      setError('Please select at least one export format');
      return;
    }

    try {
      const exportResults = [];
      
      for (const formatId of selectedFormats) {
        if (exportData[formatId]) {
          const formatInfo = ExportEngineService.getExportFormatInfo(formatId);
          exportResults.push({
            formatId,
            formatInfo,
            data: exportData[formatId],
            filename: `${contentType}_${formatId}_${Date.now()}.${formatInfo.fileType}`
          });
        }
      }
      
      onExport(exportResults);
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export data');
    }
  };

  const categories = ExportEngineService.getAllCategories();
  const activeFormats = ExportEngineService.getFormatsForCategory(activeCategory);

  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-lg ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Smart Export: Revenue Intelligence
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Export your analysis to amplify your existing tools
            </p>
          </div>
          <div className="text-sm text-blue-400">
            {recommendations.length} formats recommended
          </div>
        </div>
      </div>

      {error && (
        <div className="px-6 pt-4">
          <Callout type="error" title="Export Error">
            {error}
          </Callout>
        </div>
      )}

      {/* Smart Recommendations */}
      {recommendations.length > 0 && (
        <div className="px-6 py-4 bg-blue-950 bg-opacity-30 border-b border-gray-700">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-blue-400 text-sm font-medium">🤖 AI Recommendations</span>
          </div>
          <p className="text-sm text-gray-300 mb-3">
            Based on your existing tools, we recommend these exports:
          </p>
          <div className="flex flex-wrap gap-2">
            {recommendations.slice(0, 5).map(formatId => {
              const formatInfo = ExportEngineService.getExportFormatInfo(formatId);
              return (
                <motion.button
                  key={formatId}
                  onClick={() => handleFormatToggle(formatId)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedFormats.has(formatId)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {formatInfo.name}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Navigation */}
      <div className="px-6 py-4 border-b border-gray-700">
        <div className="flex space-x-4 overflow-x-auto">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span>{category.icon}</span>
              <span className="text-sm font-medium">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Export Formats */}
      <div className="px-6 py-4">
        <div className="space-y-3">
          {activeFormats.map(format => (
            <motion.div
              key={format.id}
              className={`border rounded-lg p-4 transition-colors ${
                selectedFormats.has(format.id)
                  ? 'border-blue-500 bg-blue-950 bg-opacity-30'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedFormats.has(format.id)}
                      onChange={() => handleFormatToggle(format.id)}
                      className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <h4 className="text-sm font-medium text-white">{format.name}</h4>
                      <p className="text-xs text-gray-400 mt-1">{format.description}</p>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                    <span>Format: {format.fileType.toUpperCase()}</span>
                    <span>•</span>
                    <span>{format.implementation}</span>
                  </div>
                </div>

                {selectedFormats.has(format.id) && exportData[format.id] && (
                  <button
                    onClick={() => handlePreview(format.id)}
                    className="text-blue-400 hover:text-blue-300 text-xs"
                  >
                    Preview
                  </button>
                )}
              </div>

              {recommendations.includes(format.id) && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-900 text-blue-200">
                    ⭐ Recommended
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Export Actions */}
      <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
        <div className="text-sm text-gray-400">
          {selectedFormats.size} format{selectedFormats.size !== 1 ? 's' : ''} selected
        </div>
        
        <div className="flex items-center space-x-3">
          {loading && <LoadingSpinner size="sm" />}
          
          <button
            onClick={handleExport}
            disabled={selectedFormats.size === 0 || loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {loading ? 'Generating...' : `Export ${selectedFormats.size} Format${selectedFormats.size !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && previewContent && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              className="bg-gray-900 border border-gray-700 rounded-lg max-w-4xl max-h-[80vh] overflow-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Preview: {ExportEngineService.getExportFormatInfo(previewContent.formatId).name}
                </h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="px-6 py-4">
                <pre className="text-sm text-gray-300 bg-gray-800 p-4 rounded-lg overflow-auto">
                  {JSON.stringify(previewContent.data, null, 2)}
                </pre>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartExportInterface;