import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { act, render, screen } from '@testing-library/react';
import { messages } from '../../translations';
import { SideMenu } from './SideMenu';
import { IntlProvider } from 'react-intl';
import userEvent from '@testing-library/user-event';
import log, { ConsoleHandler, level } from '@czarsimon/remotelogger';

const logHandlers = { console: new ConsoleHandler(level.DEBUG) };
log.configure(logHandlers);

function TestRouter() {
  const locale = 'en-US';
  return (
    <IntlProvider locale={locale} messages={messages[locale]}>
      <Router>
        <SideMenu />
        <Switch>
          <Route exact path="/certificates">
            <p>component-1</p>
          </Route>
          <Route exact path="/settings">
            <p>component-2</p>
          </Route>
          <Route path="/">
            <p>default</p>
          </Route>
        </Switch>
      </Router>
    </IntlProvider>
  );
}

test('side menu test navigation', async () => {
  await act(async () => {
    render(<TestRouter />);
  });

  const title = screen.getByText('webca.io');
  expect(title).toBeInTheDocument();

  const certItem = screen.getByText('Certificates');
  expect(certItem).toBeInTheDocument();
  const settingsItem = screen.getByText('Settings');
  expect(settingsItem).toBeInTheDocument();

  expect(screen.queryByText('component-1')).toBeFalsy();
  expect(screen.queryByText('component-2')).toBeFalsy();
  expect(screen.getByText('default')).toBeInTheDocument();

  await act(async () => userEvent.click(certItem));

  expect(screen.getByText('component-1')).toBeInTheDocument();
  expect(screen.queryByText('component-2')).toBeFalsy();
  expect(screen.queryByText('default')).toBeFalsy();

  await act(async () => userEvent.click(settingsItem));

  expect(screen.queryByText('component-1')).toBeFalsy();
  expect(screen.getByText('component-2')).toBeInTheDocument();
  expect(screen.queryByText('default')).toBeFalsy();

  await act(async () => userEvent.click(title));

  expect(screen.queryByText('component-1')).toBeFalsy();
  expect(screen.queryByText('component-2')).toBeFalsy();
  expect(screen.getByText('default')).toBeInTheDocument();
});
