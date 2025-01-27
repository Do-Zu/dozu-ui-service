'use client';
import React, { ErrorInfo, ReactNode } from 'react';
import AbstractErrorBoundary from './AbstractErrorBoundary';

class ErrorBoundary extends AbstractErrorBoundary {
  logError(error: Error, errorInfo: ErrorInfo): void {
    console.error('Logged error:', error, errorInfo);
  }

  renderFallback(error?: Error): ReactNode {
    if (this.props.children) {
      return this.props.children;
    }
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Something went wrong.</h1>
        {error && <p>{error.message}</p>}
        <button onClick={() => window.location.reload()}>Reload Page</button>
      </div>
    );
  }
}
export default ErrorBoundary;
