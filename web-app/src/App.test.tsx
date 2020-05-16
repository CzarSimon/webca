import React from 'react';
import App from './App';
import { render } from './testutils';

test('renders main app', () => {
  const { getByText } = render(<App />);
  const header = getByText(/webca.io/);
  expect(header).toBeInTheDocument();
  const description = getByText(/Webbased CA and certificicate manager/);
  expect(description).toBeInTheDocument();
});
