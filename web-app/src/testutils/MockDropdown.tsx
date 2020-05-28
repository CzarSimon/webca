import React, { FormEvent } from 'react';
import { Props as DropdownProps } from '../components/from';

export function MockDropdown({ placeholder, options, onSelect }: DropdownProps) {
  const defaultVal = options.length === 1 ? options[0].id : undefined;
  if (defaultVal && onSelect) {
    onSelect(defaultVal);
  }

  const onChange = (e: FormEvent<HTMLSelectElement>) => {
    if (onSelect) {
      onSelect(e.currentTarget.value);
    }
  };

  return (
    <select placeholder={placeholder} defaultValue={defaultVal} onChange={onChange}>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.text}
        </option>
      ))}
    </select>
  );
}
