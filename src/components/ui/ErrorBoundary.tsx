import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          <h2 className="text-lg font-bold">Algo salió mal</h2>
          <p className="text-sm">Ha ocurrido un error inesperado en la aplicación.</p>
          {this.state.error && (
            <div className="mt-3 p-3 bg-red-100 rounded text-xs font-mono overflow-auto">
              <p className="font-bold">{this.state.error.name}: {this.state.error.message}</p>
              <pre className="mt-1 whitespace-pre-wrap">{this.state.error.stack}</pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
