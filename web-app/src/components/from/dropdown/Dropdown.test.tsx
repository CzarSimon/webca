import React from 'react';
import { Dropdown } from './Dropdown';
import { render, fireEvent, act } from '@testing-library/react';
import selectEvent from 'react-select-event';

test('dropdown', async () => {
  let setValue: string = "";
  const props = {
    placeholder: "ph",
    options: [
      { id: "id-1", text: "Value 1" },
      { id: "id-2", text: "Value 2" },
    ],
    onSelect: (val: string) => {
      setValue = val;
    }
  };

  let r: ReturnType<typeof render>;
  await act(async () => {
    r = render(<Dropdown {...props} />);
  });

  // Check that select is rendered.
  const select = r.getByText(/ph/);
  expect(select).toBeInTheDocument();

  // Check that options are note visible.
  expect(r.queryByText(/Value 1/)).toBeFalsy();
  expect(r.queryByText(/Value 2/)).toBeFalsy();

  // Click display dropdown. Check that options are visible.
  fireEvent.mouseDown(select);
  expect(r.queryByText(/Value 1/)).toBeTruthy();
  expect(r.queryByText(/Value 2/)).toBeTruthy();

  // Select value 2, check that selected value changed.
  expect(setValue).toBe("");
  await selectEvent.select(select, "Value 2");
  expect(setValue).toBe("id-2");
});

test('dropdown: one value', async () => {
  let setValue: string = "";
  const props = {
    placeholder: "ph",
    options: [
      { id: "id-1", text: "Value 1" },
    ],
    onSelect: (val: string) => {
      setValue = val;
    }
  };

  expect(setValue).toBe("");
  const r = render(<Dropdown {...props} />);

  const dropdown = r.getByText(/Value 1/);
  expect(dropdown).toBeInTheDocument();
  expect(r.queryByText(/ph/)).toBeFalsy();

  expect(setValue).toBe("id-1");
});
