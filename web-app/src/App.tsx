import React, { useEffect } from 'react';
import { initState, teardown } from './state';
import './App.css';
import { checkBackendHealth } from './api';

function App() {
  useEffect(() => {
    initState();
    checkBackendHealth();
    return teardown
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>webca.io</h1>
        <p>Webbased CA and certificicate manager</p>
      </header>
    </div>
  );
}

export default App;
