import React from 'react';
import { Select } from 'antd';
import { SelectOption, Sizes } from '../types';

export interface Props {
  size?: Sizes;
  placeholder?: string;
  options: SelectOption[]
};

export function Dropdown({ placeholder, options, size = "middle" }: Props) {
  const defaultVal = (options.length === 1) ? options[0].id : undefined;
  return (
    <Select
      size={size}
      placeholder={placeholder}
      defaultValue={defaultVal}
    >
      {options.map(opt => (
        <Select.Option key={opt.id} value={opt.id}>
          {opt.text}
        </Select.Option>
      ))}
    </Select>
  );
}
