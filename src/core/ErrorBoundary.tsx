'use client';
import { ToastAction } from '@/components/ui/toast';
import { toast } from '@/hooks/use-toast';
import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state to display fallback UI
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to an external service or logging system
    console.error('Error occurred:', error);
    console.error('Error info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      toast({
        title: 'Something went wrong',
        description: this.state.errorMessage,
        variant: 'destructive',
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
