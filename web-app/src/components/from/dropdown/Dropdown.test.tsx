import React from 'react';
import { Dropdown } from './Dropdown';
import { render, screen, act, wait } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('dropdown', async () => {
  let setValue = '';
  const props = {
    placeholder: 'ph',
    options: [
      { id: 'id-1', text: 'Value 1' },
      { id: 'id-2', text: 'Value 2' },
    ],
    onSelect: (val: string) => {
      setValue = val;
    },
  };

  await act(async () => {
    render(<Dropdown {...props} />);
  });

  // Check that select is rendered.
  const select = screen.getByText(/ph/);
  expect(select).toBeInTheDocument();

  // Check that options are note visible.
  expect(screen.queryByText(/Value 2/)).toBeFalsy();
  expect(screen.queryByText(/Value 2/)).toBeFalsy();

  // Click display dropdown. Check that options are visible.
  userEvent.click(select);
  expect(screen.queryByText(/Value 1/)).toBeTruthy();
  expect(screen.queryByText(/Value 2/)).toBeTruthy();

  // Select value 2, check that selected value changed.
  expect(setValue).toBe('');
  userEvent.selectOptions(select, 'Value 2');
  wait(
    () => {
      expect(setValue).toBe('id-2');
    },
    { timeout: 1 },
  );
});

test('dropdown: one value', async () => {
  let setValue = '';
  const props = {
    placeholder: 'ph',
    options: [{ id: 'id-1', text: 'Value 1' }],
    onSelect: (val: string) => {
      setValue = val;
    },
  };

  expect(setValue).toBe('');
  render(<Dropdown {...props} />);

  const dropdown = screen.getByText(/Value 1/);
  expect(dropdown).toBeInTheDocument();
  expect(screen.queryByText(/ph/)).toBeFalsy();

  expect(setValue).toBe('id-1');
});
