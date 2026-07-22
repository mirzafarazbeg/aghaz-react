import React from 'react';

/**
 * Top-level error boundary. Catches any render error and shows a
 * friendly Urdu message instead of a blank white screen.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // In production you'd send this to an error reporting service
    console.error('App error caught by ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          textAlign: 'center',
          padding: '40px',
          fontFamily: 'Jameel Noori Nastaleeq, serif',
          direction: 'rtl',
        }}>
          <img src="/images/mascot.png" alt="Mascot" style={{ width: 100, marginBottom: 20 }} />
          <h2 style={{ fontSize: '32px', marginBottom: 10 }}>کچھ غلط ہوگیا</h2>
          <p style={{ fontSize: '20px', color: '#666', marginBottom: 24 }}>
            براہ کرم صفحہ دوبارہ لوڈ کریں
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 24px',
              fontSize: '20px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#28a745',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            دوبارہ لوڈ کریں
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
