import React from 'react';
import { Callout } from './ContentDisplay';

class AsyncErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('AsyncErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Report error to monitoring service in production
    if (process.env.NODE_ENV === 'production' && this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="p-6">
          <Callout type="error" title="Something went wrong">
            <div className="space-y-4">
              <p className="text-sm">
                {this.props.fallbackMessage || 
                  "An unexpected error occurred while processing your request. Please try again."}
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 p-3 bg-red-50 rounded border">
                  <summary className="font-medium cursor-pointer">
                    Error Details (Development Only)
                  </summary>
                  <div className="mt-2 text-xs">
                    <p><strong>Error:</strong> {this.state.error.toString()}</p>
                    <pre className="mt-2 whitespace-pre-wrap text-xs overflow-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                </details>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={this.handleRetry}
                  className="btn btn-primary"
                  type="button"
                >
                  Try Again
                </button>
                
                {this.props.onReset && (
                  <button
                    onClick={this.props.onReset}
                    className="btn btn-secondary"
                    type="button"
                  >
                    Reset Component
                  </button>
                )}
              </div>
            </div>
          </Callout>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for async error handling
export const useAsyncError = () => {
  const [asyncError, setAsyncError] = React.useState(null);

  const throwError = React.useCallback((error) => {
    setAsyncError(() => {
      throw error;
    });
  }, []);

  const clearError = React.useCallback(() => {
    setAsyncError(null);
  }, []);

  return { throwError, clearError, hasAsyncError: asyncError !== null };
};

// HOC for wrapping components with async error boundary
export const withAsyncErrorBoundary = (Component, options = {}) => {
  const WrappedComponent = (props) => {
    return (
      <AsyncErrorBoundary 
        fallbackMessage={options.fallbackMessage}
        onError={options.onError}
        onRetry={options.onRetry}
        onReset={options.onReset}
      >
        <Component {...props} />
      </AsyncErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withAsyncErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

export default AsyncErrorBoundary;