import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import MainApp from './MainApp';
import './index.css';
import './components/Mascot';

function App() {
    return (
        <Router>
            <MainApp />
        </Router>
    );
}

export default App;
