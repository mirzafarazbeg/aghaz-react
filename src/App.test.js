import React, { Suspense } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import MainApp from './MainApp';
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Jameel Noori Nastaleeq', fontSize: '24px' }}>لوڈ ہو رہا ہے…</div>}>
          <MainApp />
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
