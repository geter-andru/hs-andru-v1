// Application constants for consistent behavior across components

// Timing constants
export const TIMING = {
  // API timeouts (milliseconds)
  apiTimeout: 30000,
  shortTimeout: 10000,
  
  // Cache durations (milliseconds)
  cacheShort: 5 * 60 * 1000,      // 5 minutes
  cacheMedium: 15 * 60 * 1000,    // 15 minutes
  cacheLong: 60 * 60 * 1000,      // 1 hour
  
  // UI delays (milliseconds)
  notificationDelay: 3000,
  navigationDelay: 2000,
  animationDelay: 200,
  debounceDelay: 300,
  
  // Session management (milliseconds)
  sessionDuration: 24 * 60 * 60 * 1000,  // 24 hours
  refreshThreshold: 60 * 60 * 1000        // 1 hour
};

// Score thresholds for gamification
export const SCORES = {
  // ICP fit scores
  icpExcellent: 90,
  icpGood: 80,
  icpFair: 60,
  icpPoor: 40,
  
  // Competency levels
  competencyFoundation: 0,
  competencyDeveloping: 25,
  competencyProficient: 50,
  competencyAdvanced: 75,
  competencyExpert: 90,
  
  // Unlock thresholds
  costCalculatorUnlock: 70,
  businessCaseUnlock: 80,
  exportUnlock: 85,
  
  // Milestone points
  milestoneBasic: 50,
  milestoneIntermediate: 100,
  milestoneAdvanced: 200,
  milestoneMaster: 500
};

// Tool access requirements
export const ACCESS_REQUIREMENTS = {
  icp: {
    analyses: 0,
    score: 0,
    unlocked: true
  },
  costCalculator: {
    analyses: 3,
    score: SCORES.costCalculatorUnlock,
    unlocked: false
  },
  businessCase: {
    calculations: 2,
    impactThreshold: 100000,
    unlocked: false
  }
};

// Ranking system (Solo Leveling inspired)
export const RANKS = {
  E: { min: 0, max: 499, name: 'Foundation' },
  D: { min: 500, max: 999, name: 'Developing' },
  C: { min: 1000, max: 1999, name: 'Competent' },
  B: { min: 2000, max: 3999, name: 'Proficient' },
  A: { min: 4000, max: 7999, name: 'Advanced' },
  S: { min: 8000, max: Infinity, name: 'Strategic Master' }
};

// Form validation patterns
export const VALIDATION = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-()]+$/,
  currency: /^\d+(\.\d{2})?$/,
  percentage: /^(100(\.0{1,2})?|\d{1,2}(\.\d{1,2})?)$/,
  
  // Input limits
  maxInputLength: 255,
  maxTextareaLength: 2000,
  minPasswordLength: 8,
  
  // Numeric ranges
  minRevenue: 10000,
  maxRevenue: 1000000000,
  minGrowthRate: 0,
  maxGrowthRate: 200,
  minDealSize: 1000,
  maxDealSize: 50000000
};

// File handling constants
export const FILES = {
  // Supported formats
  exportFormats: ['pdf', 'docx', 'txt', 'json'],
  imageFormats: ['jpg', 'jpeg', 'png', 'webp'],
  
  // Size limits (bytes)
  maxUploadSize: 10 * 1024 * 1024,  // 10MB
  maxImageSize: 5 * 1024 * 1024,    // 5MB
  
  // File naming
  timestampFormat: 'YYYY-MM-DD_HH-mm-ss',
  defaultPrefix: 'hs-revenue-intelligence'
};

// API endpoints and configuration
export const API = {
  // Airtable configuration
  baseUrl: 'https://api.airtable.com/v0',
  maxRecords: 100,
  pageSize: 50,
  
  // Rate limiting
  requestsPerMinute: 60,
  burstLimit: 10,
  
  // Retry configuration
  maxRetries: 3,
  retryDelay: 1000,
  backoffMultiplier: 2
};

// Business logic constants
export const BUSINESS = {
  // Default calculation assumptions
  defaultInefficiencyRate: 0.15,     // 15%
  defaultChurnImpact: 0.05,          // 5%
  defaultGrowthWithoutAction: 0.3,   // 30% of target growth
  
  // Time periods
  quarterMonths: 3,
  yearMonths: 12,
  standardAnalysisPeriod: 12,
  
  // Currency formatting
  defaultCurrency: 'USD',
  decimalPlaces: 0,
  
  // Business case templates
  templates: {
    pilot: {
      duration: '3-6 months',
      investment: '$25,000-$75,000'
    },
    full: {
      duration: '6-18 months', 
      investment: '$100,000-$500,000'
    }
  }
};

// Error messages
export const ERRORS = {
  // Network errors
  networkError: 'Network connection failed. Please check your internet connection.',
  timeoutError: 'Request timed out. Please try again.',
  serverError: 'Server error occurred. Please try again later.',
  
  // Authentication errors
  invalidCredentials: 'Invalid customer ID or access token.',
  sessionExpired: 'Your session has expired. Please refresh the page.',
  accessDenied: 'Access denied. Please check your permissions.',
  
  // Validation errors
  requiredField: 'This field is required.',
  invalidEmail: 'Please enter a valid email address.',
  invalidNumber: 'Please enter a valid number.',
  valueOutOfRange: 'Value is outside the allowed range.',
  
  // Business logic errors
  insufficientData: 'Insufficient data to perform calculation.',
  calculationError: 'Error occurred during calculation. Please check your inputs.',
  exportError: 'Failed to export data. Please try again.'
};

// Success messages
export const SUCCESS = {
  dataSaved: 'Data saved successfully.',
  calculationComplete: 'Calculation completed successfully.',
  exportComplete: 'Export completed successfully.',
  toolUnlocked: 'New methodology unlocked!',
  milestoneReached: 'Professional milestone achieved!',
  progressUpdated: 'Progress updated successfully.'
};