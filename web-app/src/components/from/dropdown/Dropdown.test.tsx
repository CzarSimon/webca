import React from 'react';
import { Dropdown } from './Dropdown';
import { render, fireEvent, wait } from '@testing-library/react';

test('dropdown', async () => {
  const props = {
    placeholder: "ph",
    options: [
      { id: "id-1", text: "Value 1" },
      { id: "id-2", text: "Value 2" },
    ],
  };

  const r = render(<Dropdown {...props} />);

  const dropdown = r.getByText(/ph/);
  expect(dropdown).toBeInTheDocument();

  expect(r.queryByText(/Value 1/)).toBeFalsy();
  expect(r.queryByText(/Value 2/)).toBeFalsy();
});

test('dropdown: one value', async () => {
  const props = {
    placeholder: "ph",
    options: [
      { id: "id-1", text: "Value 1" },
    ],
  };

  const r = render(<Dropdown {...props} />);

  const dropdown = r.getByText(/Value 1/);
  expect(dropdown).toBeInTheDocument();
});
