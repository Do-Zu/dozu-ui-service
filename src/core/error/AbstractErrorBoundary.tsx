'use client';
import React, { ErrorInfo, ReactNode } from 'react';
import { ErrorBoundaryProps, ErrorBoundaryState } from './error';

abstract class AbstractErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: undefined,
    };
  }

  public static getDerivedStateFromError(error: Error): {
    hasError: boolean;
    error: Error;
  } {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.logError(error, errorInfo);
  }

  abstract logError(error: Error, errorInfo: ErrorInfo): void;
  abstract renderFallback(error?: Error): ReactNode;

  render(): ReactNode {
    if (this.state.hasError) {
      return this.renderFallback(this.state.error);
    }
    return this.props.children;
  }
}

export default AbstractErrorBoundary;
