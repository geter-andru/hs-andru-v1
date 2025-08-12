// Theme constants for consistent styling across the application

// Dark theme color palette
export const COLORS = {
  // Primary backgrounds
  primary: 'bg-gray-900',
  secondary: 'bg-gray-800',
  tertiary: 'bg-gray-850',
  surface: 'bg-gray-800',
  
  // Border colors
  border: 'border-gray-700',
  borderLight: 'border-gray-600',
  borderGlass: 'border-gray-700',
  
  // Text colors
  textPrimary: 'text-white',
  textSecondary: 'text-gray-400',
  textMuted: 'text-gray-500',
  
  // Interactive states
  hover: 'hover:bg-gray-700',
  focus: 'focus:ring-2 focus:ring-blue-500',
  
  // Status colors
  success: 'bg-green-900',
  successText: 'text-green-300',
  warning: 'bg-yellow-900',
  warningText: 'text-yellow-300',
  error: 'bg-red-900',
  errorText: 'text-red-300',
  
  // Brand colors
  brand: 'text-blue-400',
  brandBg: 'bg-blue-600',
  brandHover: 'hover:bg-blue-700'
};

// CSS custom properties for dynamic theming
export const CSS_VARIABLES = {
  '--color-primary': '#111827',      // gray-900
  '--color-secondary': '#1f2937',    // gray-800
  '--color-tertiary': '#374151',     // gray-700
  '--color-surface': '#1f2937',      // gray-800
  '--color-border': '#374151',       // gray-700
  '--color-text-primary': '#ffffff',
  '--color-text-secondary': '#9ca3af', // gray-400
  '--color-text-muted': '#6b7280',    // gray-500
  '--color-brand': '#60a5fa',         // blue-400
  '--color-brand-bg': '#2563eb',      // blue-600
  '--color-success': '#065f46',       // green-900
  '--color-warning': '#78350f',       // yellow-900
  '--color-error': '#7f1d1d'          // red-900
};

// Component-specific classes
export const COMPONENT_STYLES = {
  // Cards
  card: `${COLORS.surface} ${COLORS.border} rounded-lg`,
  cardPadding: 'p-6',
  cardGlass: `${COLORS.surface} ${COLORS.borderGlass} rounded-lg backdrop-blur-sm`,
  
  // Buttons
  btnPrimary: `${COLORS.brandBg} ${COLORS.brandHover} text-white px-4 py-2 rounded-md font-medium transition-colors`,
  btnSecondary: `${COLORS.secondary} ${COLORS.hover} text-white px-4 py-2 rounded-md font-medium transition-colors`,
  
  // Forms
  formInput: `w-full px-3 py-2 ${COLORS.secondary} ${COLORS.border} rounded-md text-white placeholder-gray-400 focus:outline-none ${COLORS.focus}`,
  formLabel: `block text-sm font-medium ${COLORS.textSecondary} mb-2`,
  
  // Navigation
  tabActive: `${COLORS.brandBg} text-white shadow-lg`,
  tabInactive: `${COLORS.textSecondary} ${COLORS.hover} hover:text-gray-300`,
  
  // Layout
  sidebar: `${COLORS.tertiary} ${COLORS.border}`,
  header: `${COLORS.secondary} ${COLORS.border}`,
  
  // Status indicators
  statusActive: `${COLORS.success} ${COLORS.successText}`,
  statusPending: `${COLORS.warning} ${COLORS.warningText}`,
  statusError: `${COLORS.error} ${COLORS.errorText}`
};

// Animation and transition constants
export const ANIMATIONS = {
  transition: 'transition-all duration-200',
  transitionFast: 'transition-all duration-100',
  transitionSlow: 'transition-all duration-300',
  fadeIn: 'animate-fade-in',
  slideIn: 'animate-slide-in'
};

// Spacing and sizing constants
export const SPACING = {
  xs: '0.25rem',    // 1
  sm: '0.5rem',     // 2
  md: '1rem',       // 4
  lg: '1.5rem',     // 6
  xl: '2rem',       // 8
  xxl: '3rem'       // 12
};

// Z-index layers for consistent layering
export const Z_INDEX = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  notification: 50,
  tooltip: 60
};

// Breakpoints for responsive design
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  xxl: '1536px'
};