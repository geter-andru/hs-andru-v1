/**
 * AdminModeIndicator Component
 * 
 * Subtle indicator that the platform is in demo/admin mode
 * for testing, QA, and sales demonstrations.
 */

import React from 'react';
import { motion } from 'motion/react';

const AdminModeIndicator = ({ isVisible = true, position = 'top-right' }) => {
  if (!isVisible) return null;

  const positionClasses = {
    'top-right': 'fixed top-4 right-4 z-50',
    'top-left': 'fixed top-4 left-4 z-50',
    'bottom-right': 'fixed bottom-4 right-4 z-50',
    'bottom-left': 'fixed bottom-4 left-4 z-50'
  };

  return (
    <motion.div
      className={`${positionClasses[position]} select-none`}
      initial={{ opacity: 0, scale: 0.8, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="bg-blue-900/90 backdrop-blur-sm border border-blue-500/50 rounded-lg px-3 py-2 shadow-lg">
        <div className="flex items-center space-x-2">
          <motion.div
            className="w-2 h-2 bg-blue-400 rounded-full"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-blue-200 text-sm font-medium">Demo Mode</span>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminModeIndicator;