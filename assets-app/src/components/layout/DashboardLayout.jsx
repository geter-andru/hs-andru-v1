/**
 * DashboardLayout Component - Main layout wrapper for all dashboard pages
 * 
 * Implements 80/20 main/sidebar split with responsive mobile behavior.
 * Provides consistent header, navigation, and layout structure.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Menu } from 'lucide-react';

// Logo Component
const Logo = () => (
  <div className="flex items-center space-x-2">
    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
      <span className="text-white font-bold text-sm">RI</span>
    </div>
    <span className="text-white font-medium">Revenue Intelligence</span>
  </div>
);

// Progress Indicator Component
const ProgressIndicator = ({ phase }) => {
  const phases = {
    welcome: { label: 'Welcome', step: 1, total: 3 },
    'icp-analysis': { label: 'ICP Analysis', step: 2, total: 3 },
    'cost-calculator': { label: 'Cost Calculator', step: 3, total: 3 },
    'business-case': { label: 'Business Case', step: 3, total: 3 }
  };

  const currentPhase = phases[phase] || phases.welcome;

  return (
    <div className="flex items-center space-x-3">
      <div className="hidden sm:flex items-center space-x-2">
        <span className="text-sm text-gray-400">
          Step {currentPhase.step} of {currentPhase.total}
        </span>
        <div className="flex space-x-1">
          {Array.from({ length: currentPhase.total }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < currentPhase.step ? 'bg-blue-500' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
      <span className="text-sm text-blue-400 font-medium">
        {currentPhase.label}
      </span>
    </div>
  );
};

// Mobile Sidebar Component
const MobileSidebar = ({ isOpen, onClose, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.div
            className="lg:hidden fixed inset-x-0 bottom-0 z-50 bg-gray-800 border-t border-gray-700 max-h-80 overflow-y-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Quick Reference</h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Main Dashboard Layout Component
const DashboardLayout = ({ 
  children, 
  sidebarContent, 
  currentPhase = 'welcome',
  customerName = 'Strategic Leader',
  companyName = 'Your Organization'
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Logo />
            <div className="hidden sm:block text-white">
              <span className="font-medium">{customerName}</span>
              <span className="text-gray-400 ml-2">from {companyName}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ProgressIndicator phase={currentPhase} />
            
            {/* Mobile sidebar toggle */}
            {sidebarContent && (
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-400 hover:text-white"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
        
        {/* Mobile customer info */}
        <div className="sm:hidden mt-3 text-white">
          <span className="font-medium text-sm">{customerName}</span>
          <span className="text-gray-400 ml-2 text-sm">from {companyName}</span>
        </div>
      </header>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Main Content Area - 80% width on desktop */}
          <main className="lg:col-span-4 space-y-6 sm:space-y-8">
            {children}
          </main>
          
          {/* Desktop Contextual Sidebar - 20% width on desktop */}
          {sidebarContent && (
            <aside className="hidden lg:block lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {sidebarContent}
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      >
        {sidebarContent}
      </MobileSidebar>
    </div>
  );
};

export default DashboardLayout;