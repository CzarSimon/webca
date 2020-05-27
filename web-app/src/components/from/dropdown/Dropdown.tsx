import React from 'react';
import { Select } from 'antd';
import { SelectOption, Sizes } from '../types';

const { Option } = Select;

export interface Props {
  size?: Sizes;
  placeholder?: string;
  options: SelectOption[];
  onSelect?: (value: string) => void;
}

export function Dropdown({ placeholder, options, onSelect, size = 'middle' }: Props) {
  const defaultVal = options.length === 1 ? options[0].id : undefined;
  if (defaultVal && onSelect) {
    onSelect(defaultVal);
  }

  return (
    <Select size={size} placeholder={placeholder} defaultValue={defaultVal} onSelect={onSelect}>
      {options.map((opt) => (
        <Option key={opt.id} value={opt.id}>
          {opt.text}
        </Option>
      ))}
    </Select>
  );
}
