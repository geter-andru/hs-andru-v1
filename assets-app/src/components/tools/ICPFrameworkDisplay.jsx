import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Settings, Check, X, AlertCircle, Plus, Trash2 } from 'lucide-react';

const ICPFrameworkDisplay = ({ customerData, onFrameworkUpdate }) => {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [criteria, setCriteria] = useState([
    { id: 1, name: 'Company Size', weight: 25, enabled: true, description: 'Employee count and revenue scale' },
    { id: 2, name: 'Technical Maturity', weight: 30, enabled: true, description: 'Current tech stack and capabilities' },
    { id: 3, name: 'Growth Stage', weight: 20, enabled: true, description: 'Company phase and trajectory' },
    { id: 4, name: 'Pain Point Severity', weight: 25, enabled: true, description: 'Urgency of problems we solve' }
  ]);
  const [newCriterionName, setNewCriterionName] = useState('');
  const [validationError, setValidationError] = useState('');

  // Calculate total weight for enabled criteria
  const calculateTotalWeight = (criteriaList) => {
    return criteriaList
      .filter(c => c.enabled)
      .reduce((sum, c) => sum + c.weight, 0);
  };

  // Validate weights on any change
  useEffect(() => {
    const total = calculateTotalWeight(criteria);
    if (total !== 100 && criteria.some(c => c.enabled)) {
      setValidationError(`Weights must total 100% (currently ${total}%)`);
    } else {
      setValidationError('');
    }
  }, [criteria]);

  // Update parent component when framework changes
  useEffect(() => {
    if (onFrameworkUpdate && !validationError) {
      const framework = criteria.filter(c => c.enabled).map(c => ({
        name: c.name,
        weight: c.weight,
        description: c.description
      }));
      onFrameworkUpdate(framework);
    }
  }, [criteria, validationError, onFrameworkUpdate]);

  const handleWeightChange = (id, newWeight) => {
    const weight = parseInt(newWeight) || 0;
    if (weight >= 0 && weight <= 100) {
      setCriteria(prev => prev.map(c => 
        c.id === id ? { ...c, weight } : c
      ));
    }
  };

  const handleToggleCriterion = (id) => {
    setCriteria(prev => prev.map(c => 
      c.id === id ? { ...c, enabled: !c.enabled } : c
    ));
  };

  const handleAddCriterion = () => {
    if (newCriterionName.trim()) {
      const newCriterion = {
        id: Date.now(),
        name: newCriterionName.trim(),
        weight: 0,
        enabled: true,
        description: 'Custom criterion'
      };
      setCriteria(prev => [...prev, newCriterion]);
      setNewCriterionName('');
    }
  };

  const handleDeleteCriterion = (id) => {
    setCriteria(prev => prev.filter(c => c.id !== id));
  };

  const handleAutoBalance = () => {
    const enabledCriteria = criteria.filter(c => c.enabled);
    if (enabledCriteria.length === 0) return;
    
    const weightPerCriterion = Math.floor(100 / enabledCriteria.length);
    const remainder = 100 - (weightPerCriterion * enabledCriteria.length);
    
    setCriteria(prev => prev.map((c, index) => {
      if (!c.enabled) return c;
      const enabledIndex = enabledCriteria.findIndex(ec => ec.id === c.id);
      const weight = enabledIndex === 0 
        ? weightPerCriterion + remainder 
        : weightPerCriterion;
      return { ...c, weight };
    }));
  };

  const getWeightColor = (weight) => {
    if (weight === 0) return 'text-gray-500';
    if (weight < 20) return 'text-blue-400';
    if (weight < 40) return 'text-green-400';
    return 'text-yellow-400';
  };

  const totalWeight = calculateTotalWeight(criteria);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-white">ICP Framework Configuration</h3>
            {validationError && (
              <div className="flex items-center text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                <span>{validationError}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsCustomizing(!isCustomizing)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                isCustomizing 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-1" />
              {isCustomizing ? 'Done' : 'Customize'}
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Weight Overview Bar */}
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Total Weight Distribution</span>
              <span className={`text-sm font-medium ${totalWeight === 100 ? 'text-green-400' : 'text-red-400'}`}>
                {totalWeight}%
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  totalWeight === 100 ? 'bg-green-500' : totalWeight > 100 ? 'bg-red-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${Math.min(totalWeight, 100)}%` }}
              />
            </div>
          </div>

          {/* Criteria List */}
          <div className="space-y-3">
            {criteria.map((criterion) => (
              <div 
                key={criterion.id}
                className={`border rounded-lg p-3 transition-all ${
                  criterion.enabled 
                    ? 'border-gray-600 bg-gray-800' 
                    : 'border-gray-700 bg-gray-900 opacity-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      {isCustomizing && (
                        <button
                          onClick={() => handleToggleCriterion(criterion.id)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            criterion.enabled 
                              ? 'bg-blue-600 border-blue-600' 
                              : 'border-gray-500 hover:border-gray-400'
                          }`}
                        >
                          {criterion.enabled && <Check className="w-3 h-3 text-white" />}
                        </button>
                      )}
                      <h4 className="font-medium text-white">{criterion.name}</h4>
                      {isCustomizing && criterion.id > 4 && (
                        <button
                          onClick={() => handleDeleteCriterion(criterion.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{criterion.description}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {isCustomizing && criterion.enabled ? (
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          value={criterion.weight}
                          onChange={(e) => handleWeightChange(criterion.id, e.target.value)}
                          className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                          min="0"
                          max="100"
                        />
                        <span className="text-gray-400 text-sm">%</span>
                      </div>
                    ) : (
                      <div className={`text-lg font-semibold ${getWeightColor(criterion.weight)}`}>
                        {criterion.weight}%
                      </div>
                    )}
                  </div>
                </div>

                {/* Weight Bar */}
                {criterion.enabled && (
                  <div className="mt-2">
                    <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${criterion.weight}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Custom Criterion */}
          {isCustomizing && (
            <div className="border border-dashed border-gray-600 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newCriterionName}
                  onChange={(e) => setNewCriterionName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCriterion()}
                  placeholder="Add custom criterion..."
                  className="flex-1 px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500 placeholder-gray-400"
                />
                <button
                  onClick={handleAddCriterion}
                  disabled={!newCriterionName.trim()}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Auto-Balance Button */}
          {isCustomizing && criteria.some(c => c.enabled) && (
            <div className="flex justify-end">
              <button
                onClick={handleAutoBalance}
                className="px-4 py-2 bg-gray-700 text-white rounded-md text-sm hover:bg-gray-600 transition-colors"
              >
                Auto-Balance Weights
              </button>
            </div>
          )}

          {/* Framework Summary */}
          {!isCustomizing && (
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Active Scoring Criteria</h4>
              <div className="grid grid-cols-2 gap-2">
                {criteria.filter(c => c.enabled).map(c => (
                  <div key={c.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">{c.name}:</span>
                    <span className={`font-medium ${getWeightColor(c.weight)}`}>{c.weight}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ICPFrameworkDisplay;