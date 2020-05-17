import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { IntlProvider } from "react-intl";
import { messages } from "../translations";
import log, { ConsoleHandler, level } from "@czarsimon/remotelogger";

const logHandlers = { console: new ConsoleHandler(level.DEBUG) }
log.configure(logHandlers);

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
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

function render(ui, { locale = "en-US", ...renderOptions } = {}) {
  function Wrapper({ children }) {
    return (
      <IntlProvider locale={locale} messages={messages[locale]}>
        {children}
      </IntlProvider>
    );
  }
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

export function assertNotPresent(lookupFn, regex) {
  try {
    lookupFn(regex);
    fail(new Error("element was found but should not have been"));
  } catch (error) {
    log.error(`element should not be pressent: ${error}`);
  }
}

// re-export everything
export * from '@testing-library/react';

// override render method
export { render };
