'use client';

import React, { useState } from 'react';

interface FloatingLabelInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  maxLength?: number;
}

export const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  maxLength,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;
  const isFloating = isFocused || hasValue;

  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={isFloating ? placeholder : ''}
        maxLength={maxLength}
        className="w-full h-14 px-4 pt-6 pb-2 bg-[#ebebf0] rounded-md text-base outline-none transition-all focus:bg-[#e3e3ef]"
      />
      <label
        className={`absolute left-4 transition-all pointer-events-none ${
          isFloating
            ? 'top-2 text-xs text-gray-600'
            : 'top-1/2 -translate-y-1/2 text-base text-gray-500'
        }`}
      >
        {label}
      </label>
    </div>
  );
};
