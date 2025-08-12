/**
 * Phase 7: Text Validation Utilities
 * 
 * Utility functions for extracting and validating text content
 * across all UI components for professional credibility testing.
 */

/**
 * Extract all visible text content from a DOM element and its children
 * @param {HTMLElement} element - Root element to extract text from
 * @returns {string} - All visible text content concatenated
 */
export const extractAllUIText = (element) => {
  if (!element) return '';
  
  // Get all text nodes, excluding hidden elements
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_SKIP;
        
        const style = window.getComputedStyle(parent);
        const isHidden = style.display === 'none' || 
                        style.visibility === 'hidden' || 
                        style.opacity === '0';
        
        return isHidden ? NodeFilter.FILTER_SKIP : NodeFilter.FILTER_ACCEPT;
      }
    }
  );
  
  let text = '';
  let node;
  
  while (node = walker.nextNode()) {
    text += node.textContent + ' ';
  }
  
  return text.trim();
};

/**
 * Validate language compliance for professional credibility
 * @param {string[]} prohibitedTerms - Terms that should not appear
 * @param {string[]} requiredTerms - Terms that should appear
 * @param {string} componentName - Optional component name for context
 * @returns {Object} - Compliance report
 */
export const validateLanguageCompliance = (
  prohibitedTerms = [], 
  requiredTerms = [], 
  componentName = null
) => {
  const text = extractAllUIText(document.body).toLowerCase();
  
  // Check for prohibited terms
  const violations = prohibitedTerms.filter(term => 
    text.includes(term.toLowerCase())
  );
  
  // Check for required terms
  const requiredTermsFound = requiredTerms.filter(term =>
    text.includes(term.toLowerCase())
  );
  
  // Analyze tone and formality
  const toneAnalysis = analyzeTone(text);
  
  return {
    compliant: violations.length === 0,
    violations,
    hasRequiredTerms: requiredTermsFound.length > 0,
    requiredTermsFound,
    totalText: text,
    componentName,
    ...toneAnalysis
  };
};

/**
 * Analyze the tone and formality of text content
 * @param {string} text - Text to analyze
 * @returns {Object} - Tone analysis results
 */
const analyzeTone = (text) => {
  const words = text.split(/\s+/);
  
  // Professional vocabulary indicators
  const professionalWords = [
    'professional', 'strategic', 'executive', 'competency',
    'methodology', 'framework', 'systematic', 'comprehensive',
    'sophisticated', 'intelligence', 'capability', 'readiness',
    'excellence', 'advancement', 'development', 'mastery'
  ];
  
  // Casual/informal indicators
  const casualWords = [
    'awesome', 'cool', 'sweet', 'nice', 'great', 'amazing',
    'fantastic', 'wonderful', 'super', 'totally', 'really'
  ];
  
  // Gaming terminology
  const gamingWords = [
    'level', 'xp', 'achievement', 'unlock', 'quest', 'mission',
    'score', 'points', 'reward', 'boss', 'character', 'player'
  ];
  
  const professionalCount = countMatches(words, professionalWords);
  const casualCount = countMatches(words, casualWords);
  const gamingCount = countMatches(words, gamingWords);
  
  const totalWords = words.length;
  const professionalRatio = professionalCount / totalWords;
  const casualRatio = casualCount / totalWords;
  const gamingRatio = gamingCount / totalWords;
  
  // Determine overall tone
  let tone = 'neutral';
  if (professionalRatio > 0.05 && casualRatio < 0.02 && gamingRatio === 0) {
    tone = 'professional';
  } else if (casualRatio > 0.02 || gamingRatio > 0) {
    tone = 'inappropriate';
  }
  
  // Calculate formality score (0-1, higher = more formal)
  const formalityScore = Math.min(1, (professionalRatio * 10) - (casualRatio * 20) - (gamingRatio * 50));
  
  return {
    tone,
    formalityScore: Math.max(0, formalityScore),
    professionalWordCount: professionalCount,
    casualWordCount: casualCount,
    gamingWordCount: gamingCount,
    professionalRatio,
    casualRatio,
    gamingRatio,
    totalWords
  };
};

/**
 * Count how many words from a list appear in the text
 * @param {string[]} words - Text split into words
 * @param {string[]} targetWords - Words to search for
 * @returns {number} - Count of matches
 */
const countMatches = (words, targetWords) => {
  return words.reduce((count, word) => {
    const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
    return targetWords.some(target => cleanWord.includes(target.toLowerCase())) 
      ? count + 1 
      : count;
  }, 0);
};

/**
 * Extract all component names from rendered elements
 * @param {HTMLElement} element - Root element
 * @returns {string[]} - Array of component identifiers found
 */
export const extractComponentNames = (element) => {
  const components = [];
  
  // Look for React component indicators
  const dataTestIds = element.querySelectorAll('[data-testid]');
  dataTestIds.forEach(el => {
    const testId = el.getAttribute('data-testid');
    if (testId) components.push(testId);
  });
  
  // Look for class names that suggest component names
  const allElements = element.querySelectorAll('*');
  allElements.forEach(el => {
    const className = el.className;
    if (typeof className === 'string') {
      // Look for PascalCase patterns that suggest component names
      const matches = className.match(/[A-Z][a-z]+(?:[A-Z][a-z]+)*/g);
      if (matches) {
        components.push(...matches);
      }
    }
  });
  
  return [...new Set(components)];
};

/**
 * Validate that all user-facing text meets enterprise standards
 * @param {HTMLElement} element - Root element to validate
 * @returns {Object} - Comprehensive validation report
 */
export const validateEnterpriseCompliance = (element) => {
  const text = extractAllUIText(element);
  const components = extractComponentNames(element);
  
  const gamingTerms = [
    'level up', 'levelup', 'achievement unlocked', 'xp', 'experience points',
    'quest', 'mission', 'boss', 'raid', 'loot', 'reward', 'score',
    'player', 'character', 'avatar', 'guild', 'clan'
  ];
  
  const casualTerms = [
    'awesome', 'cool', 'sweet', 'nice job', 'way to go', 'congrats',
    'yay', 'woohoo', 'amazing', 'fantastic', 'super'
  ];
  
  const requiredBusinessTerms = [
    'professional', 'strategic', 'executive', 'competency',
    'methodology', 'framework', 'analysis', 'development'
  ];
  
  // Run comprehensive validation
  const gamingViolations = gamingTerms.filter(term => 
    text.toLowerCase().includes(term.toLowerCase())
  );
  
  const casualViolations = casualTerms.filter(term =>
    text.toLowerCase().includes(term.toLowerCase())
  );
  
  const businessTermsFound = requiredBusinessTerms.filter(term =>
    text.toLowerCase().includes(term.toLowerCase())
  );
  
  const toneAnalysis = analyzeTone(text);
  
  const isCompliant = gamingViolations.length === 0 && 
                     casualViolations.length === 0 &&
                     businessTermsFound.length >= 3 &&
                     toneAnalysis.formalityScore >= 0.7;
  
  return {
    compliant: isCompliant,
    score: calculateComplianceScore(toneAnalysis, gamingViolations, casualViolations, businessTermsFound),
    violations: {
      gaming: gamingViolations,
      casual: casualViolations
    },
    businessTermsFound,
    requiredBusinessTermsMet: businessTermsFound.length >= 3,
    toneAnalysis,
    components,
    recommendations: generateRecommendations(gamingViolations, casualViolations, businessTermsFound, toneAnalysis),
    textSample: text.substring(0, 200) + (text.length > 200 ? '...' : '')
  };
};

/**
 * Calculate overall compliance score (0-100)
 */
const calculateComplianceScore = (toneAnalysis, gamingViolations, casualViolations, businessTermsFound) => {
  let score = 100;
  
  // Deduct for violations
  score -= gamingViolations.length * 25; // Gaming terms are severe
  score -= casualViolations.length * 15; // Casual terms are moderate
  
  // Add for business terms
  score += Math.min(businessTermsFound.length * 5, 25);
  
  // Factor in formality score
  score = score * toneAnalysis.formalityScore;
  
  return Math.max(0, Math.min(100, Math.round(score)));
};

/**
 * Generate specific recommendations for improvement
 */
const generateRecommendations = (gamingViolations, casualViolations, businessTermsFound, toneAnalysis) => {
  const recommendations = [];
  
  if (gamingViolations.length > 0) {
    recommendations.push(`Remove gaming terminology: ${gamingViolations.join(', ')}`);
  }
  
  if (casualViolations.length > 0) {
    recommendations.push(`Replace casual language: ${casualViolations.join(', ')}`);
  }
  
  if (businessTermsFound.length < 3) {
    recommendations.push('Increase use of professional business terminology');
  }
  
  if (toneAnalysis.formalityScore < 0.7) {
    recommendations.push('Increase formality and professional tone');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Language compliance is excellent');
  }
  
  return recommendations;
};