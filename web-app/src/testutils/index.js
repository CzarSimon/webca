import React from 'react';
import PropTypes from 'prop-types';
import { render as rtlRender } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { store } from '../state';
import { messages } from '../translations';
import log, { ConsoleHandler, level } from '@czarsimon/remotelogger';

const logHandlers = { console: new ConsoleHandler(level.DEBUG) };
log.configure(logHandlers);

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

function render(ui, { locale = 'en-US', ...renderOptions } = {}) {
  function Wrapper({ children }) {
    return (
      <IntlProvider locale={locale} messages={messages[locale]}>
        <Provider store={store}>
          <Router>{children}</Router>
        </Provider>
      </IntlProvider>
    );
  }

  Wrapper.propTypes = {
    children: PropTypes.func,
  };
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// re-export everything
export * from '@testing-library/react';

// override render method
export { render };
