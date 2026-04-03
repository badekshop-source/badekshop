// src/components/ui/country-select.tsx
'use client';

import { useState, useMemo } from 'react';
import Select from 'react-select';
import countryList from 'react-select-country-list';

interface CountryOption {
  value: string;
  label: string;
}

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function CountrySelect({ value, onChange, error }: CountrySelectProps) {
  const options = useMemo(() => countryList().getData(), []);
  
  const selectedOption = useMemo(() => {
    return options.find((option: CountryOption) => option.value === value) || null;
  }, [value, options]);

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        Nationality <span className="text-red-500">*</span>
      </label>
      <Select
        options={options}
        value={selectedOption}
        onChange={(option) => onChange(option?.value || '')}
        placeholder="Select your nationality"
        className="react-select-container"
        classNamePrefix="react-select"
        styles={{
          control: (base) => ({
            ...base,
            borderColor: error ? '#ef4444' : base.borderColor,
            '&:hover': {
              borderColor: error ? '#ef4444' : base.borderColor,
            },
          }),
        }}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}