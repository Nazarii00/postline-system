// src/utils/formUtils.ts
import React from 'react';

export const preventInvalidNumberInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
};

export const getFieldClass = (field: string, errors: Record<string, string>, extraClasses: string = '') => {
  const hasError = !!errors[field];
  return `w-full px-4 py-3.5 bg-slate-50 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-pine/20 focus:bg-white transition-all text-sm font-medium ${
    hasError
      ? 'border-rose-400 focus:border-rose-500 bg-rose-50/30'
      : 'border-slate-200 focus:border-pine'
  } ${extraClasses}`;
};

export const labelClass = 'block text-xs uppercase tracking-wider text-slate-500 font-black mb-2';