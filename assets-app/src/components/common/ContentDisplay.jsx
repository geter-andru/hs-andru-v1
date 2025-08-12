import React, { useState } from 'react';

// Component for displaying rich HTML content with expandable sections
const ContentDisplay = ({ content, className = '' }) => {
  const [expandedSections, setExpandedSections] = useState(new Set());

  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  if (!content) {
    return (
      <div className={`bg-gray-800 border border-gray-600 rounded-lg p-6 text-center ${className}`}>
        <p className="text-gray-400">No content available</p>
      </div>
    );
  }

  // Parse JSON string content if needed
  let parsedContent = content;
  if (typeof content === 'string' && (content.startsWith('{') || content.startsWith('['))) {
    try {
      parsedContent = JSON.parse(content);
    } catch (e) {
      // If parsing fails, treat as plain text/HTML
      parsedContent = content;
    }
  }

  // Handle JSON objects with structured data
  if (typeof parsedContent === 'object' && parsedContent !== null) {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Title if available */}
        {parsedContent.title && (
          <h3 className="text-lg font-semibold text-primary">{parsedContent.title}</h3>
        )}
        
        {/* Description if available */}
        {parsedContent.description && (
          <p className="text-secondary">{parsedContent.description}</p>
        )}

        {/* Render segments for ICP data */}
        {(parsedContent.segments || parsedContent.customerSegments) && Array.isArray(parsedContent.segments || parsedContent.customerSegments) && (
          <div className="space-y-3">
            <h4 className="font-medium text-primary">Customer Segments</h4>
            {(parsedContent.segments || parsedContent.customerSegments).map((segment, index) => (
              <div key={index} className="bg-surface/50 rounded-lg p-4 border border-glass-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-primary">{segment.name}</span>
                  <span className="text-brand font-semibold">{segment.score}% fit</span>
                </div>
                {segment.criteria && (
                  <ul className="text-sm text-secondary space-y-1">
                    {segment.criteria.map((criterion, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-brand mr-2">•</span>
                        {criterion}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Render categories for Cost Calculator data */}
        {parsedContent.categories && Array.isArray(parsedContent.categories) && (
          <div className="space-y-3">
            <h4 className="font-medium text-primary">Cost Categories</h4>
            {parsedContent.categories.map((category, index) => (
              <div key={index} className="bg-surface/50 rounded-lg p-4 border border-glass-border">
                <h5 className="font-medium text-primary mb-2">{category.name}</h5>
                <p className="text-sm text-secondary mb-2">{category.description}</p>
                {category.formula && (
                  <code className="text-xs bg-surface/30 px-2 py-1 rounded text-brand">
                    {category.formula}
                  </code>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Render templates for Business Case data */}
        {parsedContent.templates && Array.isArray(parsedContent.templates) && (
          <div className="space-y-3">
            <h4 className="font-medium text-primary">Templates</h4>
            {parsedContent.templates.map((template, index) => (
              <div key={index} className="bg-surface/50 rounded-lg p-4 border border-glass-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-primary">{template.name}</span>
                  <span className="text-sm text-secondary">{template.duration}</span>
                </div>
                <p className="text-sm text-secondary mb-2">{template.investment}</p>
                {template.sections && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted">Sections:</p>
                    <ul className="text-xs text-secondary space-y-1">
                      {template.sections.map((section, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-brand mr-2">•</span>
                          {section}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {template.keyPoints && (
                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-medium text-muted">Key Points:</p>
                    <ul className="text-xs text-secondary space-y-1">
                      {template.keyPoints.map((point, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-brand mr-2">•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Render key indicators for ICP data */}
        {parsedContent.keyIndicators && Array.isArray(parsedContent.keyIndicators) && (
          <div className="space-y-2">
            <h4 className="font-medium text-primary">Key Indicators</h4>
            <ul className="space-y-1">
              {parsedContent.keyIndicators.map((indicator, index) => (
                <li key={index} className="flex items-start text-sm text-secondary">
                  <span className="text-brand mr-2">•</span>
                  {indicator}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Render rating criteria for ICP data */}
        {parsedContent.ratingCriteria && Array.isArray(parsedContent.ratingCriteria) && (
          <div className="space-y-3">
            <h4 className="font-medium text-primary">Rating Criteria</h4>
            {parsedContent.ratingCriteria.map((criteria, index) => (
              <div key={index} className="bg-surface/50 rounded-lg p-3 border border-glass-border">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-primary">{criteria.name}</span>
                  <span className="text-sm text-brand">{criteria.weight}% weight</span>
                </div>
                <p className="text-sm text-secondary">{criteria.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Render frameworks for Business Case data */}
        {parsedContent.frameworks && Array.isArray(parsedContent.frameworks) && (
          <div className="space-y-3">
            <h4 className="font-medium text-primary">Frameworks</h4>
            {parsedContent.frameworks.map((framework, index) => (
              <div key={index} className="bg-surface/50 rounded-lg p-4 border border-glass-border">
                <h5 className="font-medium text-primary mb-2">{framework.name}</h5>
                {framework.formula && (
                  <code className="text-xs bg-surface/30 px-2 py-1 rounded text-brand block mb-2">
                    {framework.formula}
                  </code>
                )}
                {framework.components && (
                  <ul className="text-sm text-secondary space-y-1">
                    {framework.components.map((component, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-brand mr-2">•</span>
                        {component}
                      </li>
                    ))}
                  </ul>
                )}
                {framework.benchmark && (
                  <p className="text-xs text-muted mt-2">Benchmark: {framework.benchmark}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Render success metrics for Business Case data */}
        {parsedContent.successMetrics && Array.isArray(parsedContent.successMetrics) && (
          <div className="space-y-3">
            <h4 className="font-medium text-primary">Success Metrics</h4>
            {parsedContent.successMetrics.map((metric, index) => (
              <div key={index} className="bg-surface/50 rounded-lg p-3 border border-glass-border">
                <h5 className="font-medium text-primary mb-2">{metric.category}</h5>
                <ul className="text-sm text-secondary space-y-1">
                  {metric.metrics.map((m, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-brand mr-2">•</span>
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
        
        {/* Fallback for JSON objects that don't match structured patterns */}
        {!parsedContent.segments && 
         !parsedContent.customerSegments &&
         !parsedContent.categories && 
         !parsedContent.templates && 
         !parsedContent.keyIndicators && 
         !parsedContent.ratingCriteria && 
         !parsedContent.frameworks && 
         !parsedContent.successMetrics && 
         !parsedContent.content &&
         !parsedContent.interactive && (
          <div className="bg-surface/30 rounded-lg p-4 border border-glass-border">
            <p className="text-sm text-secondary mb-2">Raw data structure:</p>
            <pre className="text-xs text-muted bg-surface/50 p-3 rounded overflow-x-auto">
              {JSON.stringify(parsedContent, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  }

  // Handle the specific ICP data structure with content.html and content.sections
  if (parsedContent.content && typeof parsedContent.content === 'object') {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Main HTML content */}
        {parsedContent.content.html && (
          <div 
            className="prose max-w-none prose-invert [&>div]:!bg-gray-800 [&>div]:!border-gray-600 [&_h2]:!text-white [&_p]:!text-gray-300 [&_ul]:!text-gray-300 [&_.bg-white]:!bg-gray-800 [&_.bg-gray-50]:!bg-gray-700 [&_.text-blue-800]:!text-blue-400 [&_.text-blue-700]:!text-blue-300 [&_.text-gray-700]:!text-gray-300 [&_.text-gray-600]:!text-gray-400 [&_.text-gray-800]:!text-white [&_.bg-blue-50]:!bg-blue-900/20 [&_.border-blue-200]:!border-blue-600 [&_.bg-red-50]:!bg-red-900/20 [&_.border-red-200]:!border-red-600 [&_.text-red-500]:!text-red-400"
            dangerouslySetInnerHTML={{ __html: parsedContent.content.html }}
          />
        )}

        {/* Expandable sections */}
        {parsedContent.content.sections && (
          <div className="space-y-3">
            {Object.entries(parsedContent.content.sections).map(([sectionId, sectionContent]) => {
              const isExpanded = expandedSections.has(sectionId);
              
              return (
                <div key={sectionId} className="border border-gray-600 rounded-lg bg-gray-800">
                  <button
                    onClick={() => toggleSection(sectionId)}
                    className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-700 transition-colors rounded-lg"
                  >
                    <span className="font-medium text-white capitalize">
                      {sectionId.replace(/[_-]/g, ' ')}
                    </span>
                    <svg
                      className={`w-5 h-5 text-gray-400 transform transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isExpanded && (
                    <div className="px-4 pb-4">
                      <div 
                        className="prose max-w-none prose-sm prose-invert [&_.bg-gray-50]:!bg-gray-700 [&_.text-gray-700]:!text-gray-300 [&_.text-gray-600]:!text-gray-400 [&_.text-gray-800]:!text-white [&_.bg-red-50]:!bg-red-900/20 [&_.border-red-200]:!border-red-600 [&_.text-red-500]:!text-red-400 [&_.w-2]:!bg-blue-500"
                        dangerouslySetInnerHTML={{ __html: sectionContent }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Interactive scoring criteria */}
        {parsedContent.interactive && parsedContent.interactive.scoring_criteria && (
          <div className="space-y-3">
            <h4 className="font-medium text-white">Scoring Criteria</h4>
            {parsedContent.interactive.scoring_criteria.map((criteria, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">{criteria.category}</span>
                  <span className="text-sm text-blue-400">{criteria.weight}% weight</span>
                </div>
                <p className="text-sm text-gray-300 mb-2">{criteria.description}</p>
                <div className="text-xs text-gray-400">Max Score: {criteria.max_score}</div>
              </div>
            ))}
          </div>
        )}

        {/* Interactive rating questions */}
        {parsedContent.interactive && parsedContent.interactive.rating_questions && (
          <div className="space-y-3">
            <h4 className="font-medium text-white">Assessment Questions</h4>
            {parsedContent.interactive.rating_questions.map((question, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <div className="mb-3">
                  <span className="text-sm text-blue-400 font-medium">{question.category}</span>
                  <h5 className="font-medium text-white">{question.question}</h5>
                </div>
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center justify-between bg-gray-800 rounded p-2">
                      <span className="text-sm text-gray-300">{option.text}</span>
                      <span className="text-xs text-blue-400 font-medium">{option.score} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // If content has sections, render expandable sections
  if (parsedContent.sections && typeof parsedContent.sections === 'object') {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Main content if available */}
        {parsedContent.html && (
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: parsedContent.html }}
          />
        )}

        {/* Expandable sections */}
        <div className="space-y-3">
          {Object.entries(parsedContent.sections).map(([sectionId, sectionContent]) => {
            const isExpanded = expandedSections.has(sectionId);
            
            return (
              <div key={sectionId} className="border border-glass-border rounded-lg bg-surface/30">
                <button
                  onClick={() => toggleSection(sectionId)}
                  className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-surface/50 transition-colors rounded-lg"
                >
                  <span className="font-medium text-primary capitalize">
                    {sectionId.replace(/[_-]/g, ' ')}
                  </span>
                  <svg
                    className={`w-5 h-5 text-muted transform transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isExpanded && (
                  <div className="px-4 pb-4">
                    <div 
                      className="prose max-w-none prose-sm"
                      dangerouslySetInnerHTML={{ __html: sectionContent }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Simple HTML content display
  return (
    <div 
      className={`prose max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: parsedContent.html || parsedContent }}
    />
  );
};

// Component for displaying formatted lists or bullet points
export const ListDisplay = ({ items, ordered = false, className = '' }) => {
  if (!items || !Array.isArray(items)) return null;

  const ListTag = ordered ? 'ol' : 'ul';
  const listClass = ordered 
    ? 'list-decimal list-inside space-y-2' 
    : 'list-disc list-inside space-y-2';

  return (
    <ListTag className={`${listClass} text-gray-700 ${className}`}>
      {items.map((item, index) => (
        <li key={index} className="leading-relaxed">
          {typeof item === 'string' ? item : (
            <div dangerouslySetInnerHTML={{ __html: item }} />
          )}
        </li>
      ))}
    </ListTag>
  );
};

// Component for displaying key-value pairs
export const DefinitionList = ({ items, className = '' }) => {
  if (!items || typeof items !== 'object') return null;

  return (
    <dl className={`space-y-3 ${className}`}>
      {Object.entries(items).map(([key, value]) => (
        <div key={key} className="flex flex-col sm:flex-row sm:space-x-4">
          <dt className="font-medium text-gray-900 sm:w-1/3 capitalize">
            {key.replace(/[_-]/g, ' ')}:
          </dt>
          <dd className="text-gray-700 sm:w-2/3">
            {typeof value === 'string' ? (
              <span dangerouslySetInnerHTML={{ __html: value }} />
            ) : (
              JSON.stringify(value)
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
};

// Component for highlighting important callouts or tips
export const Callout = ({ type = 'info', title, children, className = '' }) => {
  const typeStyles = {
    info: 'bg-brand/10 border-brand/20 text-primary',
    success: 'bg-success/10 border-success/20 text-primary',
    warning: 'bg-warning/10 border-warning/20 text-primary',
    error: 'bg-danger/10 border-danger/20 text-primary'
  };

  const iconStyles = {
    info: 'text-brand',
    success: 'text-success', 
    warning: 'text-warning',
    error: 'text-danger'
  };

  const icons = {
    info: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    )
  };

  return (
    <div className={`rounded-lg border p-4 ${typeStyles[type]} ${className}`}>
      <div className="flex">
        <div className={`flex-shrink-0 ${iconStyles[type]}`}>
          {icons[type]}
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h4 className="text-sm font-medium mb-2">{title}</h4>
          )}
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default ContentDisplay;