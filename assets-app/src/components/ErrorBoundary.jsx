/**
 * ErrorBoundary Component
 * 
 * Global error boundary to catch and handle errors gracefully,
 * preventing users from getting stuck with crashed screens.
 */

import React from 'react';
import { PrimaryButton, SecondaryButton } from './ui/ButtonComponents';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
          <div className="bg-gray-800 border border-red-500 rounded-lg p-8 max-w-md w-full text-center">
            <div className="text-red-400 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-white mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-300 mb-6">
              The platform encountered an unexpected error. Please try refreshing the page or returning to the dashboard.
            </p>
            
            {/* Show error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mb-6 bg-gray-900 rounded-lg p-4">
                <summary className="text-sm text-gray-400 cursor-pointer">
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs text-red-400 mt-2 overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            
            <div className="space-y-3">
              <PrimaryButton
                onClick={this.handleRefresh}
                className="w-full"
              >
                Refresh Page
              </PrimaryButton>
              <SecondaryButton
                onClick={this.handleGoHome}
                className="w-full"
              >
                Return to Dashboard
              </SecondaryButton>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;