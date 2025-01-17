export interface ErrorBoundaryProps {
    children?: ReactNode;
  }
  
export  interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | undefined;
  }