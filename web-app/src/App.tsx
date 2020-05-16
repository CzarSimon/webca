import React, { useEffect } from 'react';
import { initState, teardown } from './state';
import { checkBackendHealth } from './api';
import { SignUpContainer } from './modules/signup';

import 'antd/dist/antd.css';
import './App.css';

function App() {
  useEffect(() => {
    initState();
    checkBackendHealth();
    return teardown
  }, []);

  return (
    <div className="App">
      <SignUpContainer />
    </div>
  );
}

export default App;
