'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FloatingLabelSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export const FloatingLabelSelect: React.FC<FloatingLabelSelectProps> = ({
  label,
  value,
  onChange,
  options,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;
  const isFloating = isFocused || hasValue;

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="w-full h-14 px-4 pt-6 pb-2 bg-[#ebebf0] rounded-md text-base outline-none appearance-none transition-all focus:bg-[#e3e3ef] cursor-pointer"
      >
        <option value="" disabled></option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <label
        className={`absolute left-4 transition-all pointer-events-none ${
          isFloating
            ? 'top-2 text-xs text-gray-600'
            : 'top-1/2 -translate-y-1/2 text-base text-gray-500'
        }`}
      >
        {label}
      </label>
      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
    </div>
  );
};
