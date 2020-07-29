import React from 'react';
import { render } from '../../testutils';
import { initStore } from '../../state';
import { screen } from '@testing-library/react';
import { ErrorInfo } from '../../types';
import { addError, removeError } from '../../state/error';

test('ErrorNotification: displays error when present and not when removed', async () => {
  const store = initStore();

  const err: ErrorInfo = {
    info: 'error info',
    error: new Error('error body'),
  };

  // Render provides an ErrorNotification instance.
  render(<div />, { reduxStore: store });
  expect(screen.queryByText(/error info/)).toBeFalsy();

  store.dispatch(addError(err));
  expect(screen.getByText(/error info/)).toBeInTheDocument();

  store.dispatch(removeError());
  expect(screen.queryByText(/error info/)).toBeFalsy();
});
