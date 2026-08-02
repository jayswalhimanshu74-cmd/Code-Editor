import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          fontFamily: 'sans-serif',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#f43f5e' }}>Something went wrong.</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem', maxWidth: '600px' }}>
            The application encountered an unexpected UI error. Please refresh the page or return to the dashboard.
          </p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Return to Dashboard
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;