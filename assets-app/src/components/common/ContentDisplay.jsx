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
      <div className={`bg-gray-50 rounded-lg p-6 text-center ${className}`}>
        <p className="text-gray-500">No content available</p>
      </div>
    );
  }

  // If content has sections, render expandable sections
  if (content.sections && typeof content.sections === 'object') {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Main content if available */}
        {content.html && (
          <div 
            className="prose prose-gray max-w-none"
            dangerouslySetInnerHTML={{ __html: content.html }}
          />
        )}

        {/* Expandable sections */}
        <div className="space-y-3">
          {Object.entries(content.sections).map(([sectionId, sectionContent]) => {
            const isExpanded = expandedSections.has(sectionId);
            
            return (
              <div key={sectionId} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection(sectionId)}
                  className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-lg"
                >
                  <span className="font-medium text-gray-900 capitalize">
                    {sectionId.replace(/[_-]/g, ' ')}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transform transition-transform ${
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
                      className="prose prose-gray max-w-none prose-sm"
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
      className={`prose prose-gray max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: content.html || content }}
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
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800'
  };

  const iconStyles = {
    info: 'text-blue-400',
    success: 'text-green-400', 
    warning: 'text-yellow-400',
    error: 'text-red-400'
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