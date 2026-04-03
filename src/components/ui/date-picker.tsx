// src/components/ui/date-picker.tsx
'use client';

import { useState } from 'react';
import { format, addDays, isBefore, startOfDay } from 'date-fns';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  required?: boolean;
}

export function DatePicker({ 
  value, 
  onChange, 
  error, 
  label = 'Arrival Date',
  required = true 
}: DatePickerProps) {
  const today = startOfDay(new Date());
  const minDate = format(today, 'yyyy-MM-dd');

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="date"
        value={value}
        min={minDate}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-gray-500">
        Cannot select past dates
      </p>
    </div>
  );
}