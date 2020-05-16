import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { initState, teardown } from './state';
import { checkBackendHealth } from './api';

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
      <header className="App-header">
        <h1>webca.io</h1>
        <FormattedMessage id="app.description" />
      </header>
    </div>
  );
}

export default App;
