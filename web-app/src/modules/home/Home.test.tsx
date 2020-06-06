import React from 'react';
import { act, screen } from '@testing-library/react';
import { render } from '../../testutils';
import { Home } from './Home';

test('home component should render', async () => {
  await act(async () => {
    render(<Home />);
  });

  expect(screen.getByRole('heading', { name: 'webca.io' })).toBeInTheDocument();
  expect(screen.getByText('Web based certificate authority')).toBeInTheDocument();
});
