import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText,
  Download,
  Search,
  Filter,
  Clock,
  TrendingUp,
  Star,
  Bookmark,
  Users,
  Target,
  BarChart3,
  Briefcase,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  Eye,
  Copy
} from 'lucide-react';
import { useUserIntelligence } from '../../contexts/simplified/UserIntelligenceContext';
import { TaskResourceMatcher } from '../../services/TaskResourceMatcher';
import { TaskCompletionService } from '../../services/TaskCompletionService';

const SimplifiedResourceLibrary = ({ customerId }) => {
  const navigate = useNavigate();
  const { assessment, milestone, usage, updateUsage } = useUserIntelligence();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTier, setSelectedTier] = useState('current');
  const [viewMode, setViewMode] = useState('grid');
  const [completedTasks, setCompletedTasks] = useState([]);
  const [taskDrivenRecs, setTaskDrivenRecs] = useState([]);

  // Resource database organized by tier and category
  const resourceDatabase = useMemo(() => ({
    foundation: {
      'ICP Intelligence': [
        {
          id: 'icp-basics-1',
          title: 'Basic Buyer Personas Template',
          description: 'Simple framework for identifying and documenting buyer personas',
          type: 'template',
          duration: '30 min',
          popularity: 95,
          tags: ['personas', 'targeting', 'fundamentals'],
          content: 'Comprehensive template with stakeholder mapping...'
        },
        {
          id: 'icp-basics-2',
          title: 'Technical Translation 101',
          description: 'Convert technical features into business benefits',
          type: 'guide',
          duration: '45 min',
          popularity: 88,
          tags: ['communication', 'value-prop', 'technical'],
          content: 'Step-by-step guide for technical founders...'
        },
        {
          id: 'icp-basics-3',
          title: 'Customer Interview Scripts',
          description: 'Ready-to-use interview scripts for buyer research',
          type: 'script',
          duration: '20 min',
          popularity: 92,
          tags: ['research', 'validation', 'interviews'],
          content: 'Proven interview questions and frameworks...'
        }
      ],
      'Value Communication': [
        {
          id: 'value-basics-1',
          title: 'ROI Calculator Template',
          description: 'Simple ROI calculation framework for early-stage companies',
          type: 'calculator',
          duration: '25 min',
          popularity: 89,
          tags: ['roi', 'financials', 'business-case'],
          content: 'Excel template with automated calculations...'
        },
        {
          id: 'value-basics-2',
          title: 'Founder Sales Scripts',
          description: 'Email and call scripts tailored for technical founders',
          type: 'script',
          duration: '35 min',
          popularity: 85,
          tags: ['sales', 'communication', 'outreach'],
          content: 'Proven scripts with technical founder voice...'
        }
      ],
      'Implementation': [
        {
          id: 'impl-basics-1',
          title: 'PMF Assessment Tools',
          description: 'Systematic approach to measuring product-market fit',
          type: 'assessment',
          duration: '40 min',
          popularity: 87,
          tags: ['pmf', 'metrics', 'validation'],
          content: 'Comprehensive PMF measurement framework...'
        }
      ]
    },
    growth: {
      'ICP Intelligence': [
        {
          id: 'icp-growth-1',
          title: 'Enterprise Persona Mapping',
          description: 'Advanced personas for complex enterprise sales',
          type: 'framework',
          duration: '60 min',
          popularity: 91,
          tags: ['enterprise', 'stakeholders', 'complex-sales'],
          content: 'Multi-stakeholder mapping with influence analysis...'
        },
        {
          id: 'icp-growth-2',
          title: 'Competitive Analysis Framework',
          description: 'Systematic competitive positioning and intelligence',
          type: 'framework',
          duration: '50 min',
          popularity: 88,
          tags: ['competitive', 'positioning', 'market'],
          content: 'Complete competitive intelligence system...'
        }
      ],
      'Value Communication': [
        {
          id: 'value-growth-1',
          title: 'Multi-Stakeholder Business Cases',
          description: 'Business cases tailored for different stakeholder perspectives',
          type: 'template',
          duration: '45 min',
          popularity: 93,
          tags: ['business-case', 'stakeholders', 'enterprise'],
          content: 'Templates for CFO, CTO, and COO perspectives...'
        },
        {
          id: 'value-growth-2',
          title: 'Advanced ROI Modeling',
          description: 'Sophisticated financial models for enterprise deals',
          type: 'model',
          duration: '70 min',
          popularity: 86,
          tags: ['roi', 'financial-modeling', 'enterprise'],
          content: 'Advanced Excel models with scenario planning...'
        }
      ],
      'Implementation': [
        {
          id: 'impl-growth-1',
          title: 'Sales Team Training Materials',
          description: 'Comprehensive training for scaling sales operations',
          type: 'training',
          duration: '90 min',
          popularity: 84,
          tags: ['training', 'team', 'scaling'],
          content: 'Complete sales enablement curriculum...'
        }
      ]
    },
    expansion: {
      'ICP Intelligence': [
        {
          id: 'icp-expansion-1',
          title: 'Strategic Market Intelligence',
          description: 'Advanced market analysis for strategic positioning',
          type: 'framework',
          duration: '80 min',
          popularity: 89,
          tags: ['market-intel', 'strategy', 'positioning'],
          content: 'Strategic market mapping and analysis...'
        }
      ],
      'Value Communication': [
        {
          id: 'value-expansion-1',
          title: 'Executive Communication Mastery',
          description: 'Board-level presentation frameworks and techniques',
          type: 'guide',
          duration: '60 min',
          popularity: 95,
          tags: ['executive', 'board', 'communication'],
          content: 'C-suite communication strategies and templates...'
        },
        {
          id: 'value-expansion-2',
          title: 'Series B Preparation Kit',
          description: 'Revenue operations optimization for next funding round',
          type: 'kit',
          duration: '120 min',
          popularity: 87,
          tags: ['series-b', 'fundraising', 'revenue-ops'],
          content: 'Complete revenue operations audit and optimization...'
        }
      ],
      'Implementation': [
        {
          id: 'impl-expansion-1',
          title: 'Market Expansion Strategy',
          description: 'Systematic approach to new market penetration',
          type: 'strategy',
          duration: '100 min',
          popularity: 82,
          tags: ['expansion', 'market-entry', 'strategy'],
          content: 'Market expansion playbook with risk assessment...'
        }
      ]
    }
  }), []);

  // Load completed tasks and generate task-driven recommendations
  useEffect(() => {
    const loadCompletedTasks = () => {
      try {
        // Get completed tasks from local storage
        const storageKey = `taskUsageData_${customerId}`;
        const taskData = JSON.parse(localStorage.getItem(storageKey) || '{}');
        
        // Extract completed task information
        const tasks = [];
        if (taskData.completedTasksHistory) {
          tasks.push(...taskData.completedTasksHistory);
        }
        
        setCompletedTasks(tasks);
        
        // Generate task-driven recommendations
        if (tasks.length > 0 && assessment && milestone) {
          const customerData = {
            customerId,
            competencyScores: assessment.competencyScores,
            milestone
          };
          
          const recommendations = TaskResourceMatcher.getCachedRecommendations(
            customerId,
            tasks,
            customerData,
            { usage, assessment }
          );
          
          setTaskDrivenRecs(recommendations);
        }
        
      } catch (error) {
        console.error('Error loading completed tasks:', error);
        setCompletedTasks([]);
        setTaskDrivenRecs([]);
      }
    };

    if (customerId && assessment) {
      loadCompletedTasks();
    }
  }, [customerId, assessment, milestone, usage]);

  // Generate smart recommendations based on usage patterns and completed tasks
  const smartRecommendations = useMemo(() => {
    const recommendations = [];
    
    // Task-driven recommendations (highest priority)
    taskDrivenRecs.forEach((rec, index) => {
      const resource = findResourceById(rec.resourceId);
      if (resource) {
        recommendations.push({
          id: `task-rec-${index}`,
          title: resource.title,
          description: `${rec.reason} - ${resource.description}`,
          category: rec.category,
          tier: milestone?.tier || 'foundation',
          priority: rec.priority,
          source: rec.source,
          resourceId: rec.resourceId,
          competencyArea: rec.competencyArea,
          currentScore: rec.currentScore
        });
      }
    });

    // If user frequently uses ICP but rarely exports
    if ((usage?.icpProgress || 0) > 70 && !(usage?.lastICPExport)) {
      recommendations.push({
        id: 'rec-1',
        title: 'Implementation Templates',
        description: 'Turn your ICP insights into actionable templates',
        category: 'Implementation',
        tier: milestone?.tier || 'foundation',
        priority: 'high',
        source: 'usage-pattern'
      });
    }
    
    // If user calculates costs but doesn't build business cases
    if ((usage?.financialProgress || 0) > 50 && !(usage?.lastBusinessCaseExport)) {
      recommendations.push({
        id: 'rec-2',
        title: 'Business Case Templates',
        description: 'Convert financial calculations into stakeholder-ready cases',
        category: 'Value Communication',
        tier: milestone?.tier || 'foundation',
        priority: 'high',
        source: 'usage-pattern'
      });
    }
    
    // Performance-based recommendations
    if (assessment?.performance?.level === 'Critical') {
      recommendations.push({
        id: 'rec-3',
        title: 'Quick Win Templates',
        description: 'Immediate impact resources for urgent improvements',
        category: 'Value Communication',
        tier: 'foundation',
        priority: 'urgent',
        source: 'performance-based'
      });
    }
    
    // Competency gap recommendations
    if (assessment?.competencyScores) {
      Object.entries(assessment.competencyScores).forEach(([competency, score]) => {
        if (score < 60) {
          const categoryMap = {
            customerAnalysis: 'ICP Intelligence',
            valueCommunication: 'Value Communication',
            executiveReadiness: 'Implementation'
          };
          
          recommendations.push({
            id: `competency-${competency}`,
            title: `${categoryMap[competency]} Fundamentals`,
            description: `Strengthen ${competency} skills (current: ${score}%)`,
            category: categoryMap[competency],
            tier: 'foundation',
            priority: score < 40 ? 'urgent' : 'high',
            source: 'competency-gap',
            competencyArea: competency,
            currentScore: score
          });
        }
      });
    }
    
    // Remove duplicates and prioritize
    const uniqueRecs = recommendations.reduce((acc, rec) => {
      const existing = acc.find(r => r.title === rec.title || r.resourceId === rec.resourceId);
      if (!existing) {
        acc.push(rec);
      }
      return acc;
    }, []);

    // Sort by priority and source
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    const sourceOrder = {
      'task-completion': 5,
      'competency-gap': 4,
      'usage-pattern': 3,
      'performance-based': 2,
      'task-progression': 1
    };

    return uniqueRecs.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return sourceOrder[b.source] - sourceOrder[a.source];
    }).slice(0, 6); // Limit to top 6 recommendations
    
  }, [usage, assessment, milestone, taskDrivenRecs]);

  // Helper function to find resource by ID
  const findResourceById = useCallback((resourceId) => {
    for (const tier of Object.values(resourceDatabase)) {
      for (const category of Object.values(tier)) {
        const resource = category.find(r => r.id === resourceId);
        if (resource) return resource;
      }
    }
    return null;
  }, [resourceDatabase]);

  // Filter resources based on current selections
  const filteredResources = useMemo(() => {
    const tierToShow = selectedTier === 'current' ? milestone?.tier || 'foundation' : selectedTier;
    const tierResources = resourceDatabase[tierToShow] || resourceDatabase.foundation;
    
    let resources = [];
    
    if (selectedCategory === 'all') {
      Object.values(tierResources).forEach(categoryResources => {
        resources.push(...categoryResources);
      });
    } else {
      resources = tierResources[selectedCategory] || [];
    }
    
    // Apply search filter
    if (searchTerm) {
      resources = resources.filter(resource => 
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Sort by popularity
    return resources.sort((a, b) => b.popularity - a.popularity);
  }, [resourceDatabase, selectedTier, selectedCategory, searchTerm, milestone]);

  // Track resource access
  const handleResourceAccess = useCallback((resource) => {
    updateUsage({
      resourcesAccessed: (usage?.resourcesAccessed || 0) + 1,
      lastResourceAccess: Date.now(),
      mostAccessedCategories: {
        ...usage?.mostAccessedCategories,
        [selectedCategory]: (usage?.mostAccessedCategories?.[selectedCategory] || 0) + 1
      }
    });
  }, [updateUsage, usage, selectedCategory]);

  // Resource type icons
  const getResourceIcon = (type) => {
    const icons = {
      template: FileText,
      guide: Briefcase,
      script: MessageSquare,
      calculator: BarChart3,
      framework: Target,
      assessment: CheckCircle,
      model: TrendingUp,
      training: Users,
      kit: Bookmark,
      strategy: Star
    };
    return icons[type] || FileText;
  };

  // Category colors
  const getCategoryColor = (category) => {
    const colors = {
      'ICP Intelligence': 'blue',
      'Value Communication': 'green',
      'Implementation': 'purple'
    };
    return colors[category] || 'gray';
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/customer/${customerId}/simplified/dashboard`)}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">Resource Library</h1>
          <p className="text-gray-400">Implementation templates and frameworks for systematic business development</p>
        </div>

        {/* Smart Recommendations */}
        {smartRecommendations.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">Recommended for You</h2>
              {completedTasks.length > 0 && (
                <span className="text-sm text-green-400">
                  Based on {completedTasks.length} completed task{completedTasks.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {smartRecommendations.map((rec) => (
                <div key={rec.id} className={`border rounded-lg p-4 ${
                  rec.source === 'task-completion' ? 'bg-green-900/20 border-green-800' :
                  rec.source === 'competency-gap' ? 'bg-orange-900/20 border-orange-800' :
                  'bg-blue-900/20 border-blue-800'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-medium">{rec.title}</h3>
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-1 rounded text-xs text-center ${
                        rec.priority === 'urgent' ? 'bg-red-900/30 text-red-400' :
                        rec.priority === 'high' ? 'bg-yellow-900/30 text-yellow-400' :
                        rec.priority === 'medium' ? 'bg-blue-900/30 text-blue-400' :
                        'bg-gray-900/30 text-gray-400'
                      }`}>
                        {rec.priority}
                      </span>
                      {rec.source && (
                        <span className={`px-1 py-0.5 rounded text-xs text-center ${
                          rec.source === 'task-completion' ? 'bg-green-900/30 text-green-400' :
                          rec.source === 'competency-gap' ? 'bg-orange-900/30 text-orange-400' :
                          rec.source === 'usage-pattern' ? 'bg-purple-900/30 text-purple-400' :
                          'bg-gray-900/30 text-gray-400'
                        }`}>
                          {rec.source === 'task-completion' ? 'Task' :
                           rec.source === 'competency-gap' ? 'Gap' :
                           rec.source === 'usage-pattern' ? 'Usage' :
                           rec.source === 'performance-based' ? 'Perf' : 'Misc'}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{rec.description}</p>
                  {rec.competencyArea && rec.currentScore && (
                    <div className="text-xs text-gray-500 mb-2">
                      Current {rec.competencyArea}: {rec.currentScore}%
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedCategory(rec.category);
                        setSelectedTier(rec.tier);
                      }}
                      className="flex-1 text-blue-400 hover:text-blue-300 text-sm flex items-center justify-center gap-1"
                    >
                      View Resources <ArrowRight className="w-3 h-3" />
                    </button>
                    {rec.resourceId && (
                      <button
                        onClick={() => {
                          const resource = findResourceById(rec.resourceId);
                          if (resource) {
                            handleResourceAccess(resource);
                          }
                        }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                      >
                        Open
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search resources..."
                  className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="ICP Intelligence">ICP Intelligence</option>
              <option value="Value Communication">Value Communication</option>
              <option value="Implementation">Implementation</option>
            </select>

            {/* Tier Filter */}
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="current">Current Stage</option>
              <option value="foundation">Foundation</option>
              <option value="growth">Growth</option>
              <option value="expansion">Expansion</option>
            </select>

            {/* View Mode */}
            <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <div className="w-4 h-4 flex flex-col gap-0.5">
                  <div className="bg-current h-1 rounded-sm"></div>
                  <div className="bg-current h-1 rounded-sm"></div>
                  <div className="bg-current h-1 rounded-sm"></div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Resources Grid/List */}
        {filteredResources.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }>
            {filteredResources.map((resource) => {
              const ResourceIcon = getResourceIcon(resource.type);
              const categoryColor = getCategoryColor(
                Object.keys(resourceDatabase[selectedTier === 'current' ? milestone?.tier || 'foundation' : selectedTier]).find(cat =>
                  resourceDatabase[selectedTier === 'current' ? milestone?.tier || 'foundation' : selectedTier][cat].includes(resource)
                )
              );
              
              return (
                <div key={resource.id} className={viewMode === 'grid' 
                  ? 'bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors'
                  : 'bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center gap-4 hover:border-gray-700 transition-colors'
                }>
                  {viewMode === 'grid' ? (
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2 rounded-lg bg-${categoryColor}-900/30`}>
                          <ResourceIcon className={`w-5 h-5 text-${categoryColor}-400`} />
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-gray-400 text-sm">{resource.popularity}%</span>
                        </div>
                      </div>
                      
                      <h3 className="text-white font-semibold mb-2">{resource.title}</h3>
                      <p className="text-gray-400 text-sm mb-3">{resource.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {resource.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
                          {resource.type}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mb-4">
                        {resource.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-gray-800 text-gray-400 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleResourceAccess(resource)}
                          className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => {
                            handleResourceAccess(resource);
                            navigator.clipboard.writeText(resource.content);
                          }}
                          className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={`p-3 rounded-lg bg-${categoryColor}-900/30 flex-shrink-0`}>
                        <ResourceIcon className={`w-6 h-6 text-${categoryColor}-400`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-white font-semibold">{resource.title}</h3>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400" />
                            <span className="text-gray-400 text-xs">{resource.popularity}%</span>
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{resource.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{resource.duration}</span>
                          <span>{resource.type}</span>
                          <div className="flex gap-1">
                            {resource.tags.slice(0, 2).map((tag) => (
                              <span key={tag} className="px-1 py-0.5 bg-gray-800 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleResourceAccess(resource)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">No resources found</p>
            <p className="text-gray-500 text-sm">Try adjusting your filters or search terms</p>
          </div>
        )}

        {/* Usage Stats */}
        <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Your Progress & Usage</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {completedTasks.length}
              </div>
              <div className="text-gray-400 text-sm">Tasks Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {usage?.resourcesAccessed || 0}
              </div>
              <div className="text-gray-400 text-sm">Resources Accessed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400 mb-1">
                {taskDrivenRecs.length}
              </div>
              <div className="text-gray-400 text-sm">Smart Recommendations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {milestone?.tier?.charAt(0).toUpperCase() + milestone?.tier?.slice(1) || 'Foundation'}
              </div>
              <div className="text-gray-400 text-sm">Current Stage</div>
            </div>
          </div>
          
          {/* Task Completion Insights */}
          {completedTasks.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-800">
              <h4 className="text-white font-medium mb-3">Recent Task Insights</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-sm text-gray-400 mb-1">Most Recent Task</div>
                  <div className="text-white font-medium">
                    {completedTasks[completedTasks.length - 1]?.name || 'Task completed'}
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-sm text-gray-400 mb-1">Completion Rate</div>
                  <div className="text-white font-medium">
                    {completedTasks.length} task{completedTasks.length > 1 ? 's' : ''} this session
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimplifiedResourceLibrary;