import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('RevenuePilot ErrorBoundary caught an exception:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '280px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)', borderRadius: 12, padding: 32, textAlign: 'center', margin: '20px 0'
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⚡</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)', margin: '0 0 8px' }}>
            {this.props.fallbackTitle || 'RevenuePilot Encountered a View Issue'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '0 0 16px', maxWidth: 440, lineHeight: 1.5 }}>
            {this.state.error?.message || 'An unexpected rendering state occurred in this component.'}
          </p>
          <button
            className="btn-copilot btn-copilot-primary"
            onClick={() => this.setState({ hasError: false })}
          >
            <RefreshCw size={14} /> Retry View
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
