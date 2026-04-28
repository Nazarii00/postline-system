// src/utils/formUtils.ts
import React from 'react';

export const INPUT_LIMITS = {
  nameMin: 2,
  nameMax: 100,
  shortNameMax: 40,
  cityMin: 2,
  cityMax: 100,
  addressMin: 5,
  addressMax: 200,
  emailMax: 100,
  passwordMin: 8,
  passwordMax: 64,
  noteMax: 500,
  trackingMin: 5,
  trackingMax: 20,
  moneyMax: 100000,
  weightMin: 0.1,
  weightMax: 1000,
  dimensionMin: 1,
  dimensionMax: 300,
  distanceKmMax: 10000,
  durationHoursMax: 240,
  routeStopsMax: 10,
} as const;

export const INPUT_PATTERNS = {
  personName: "^[A-Za-zА-Яа-яІіЇїЄєҐґ' -]+$",
  city: "^[A-Za-zА-Яа-яІіЇїЄєҐґ' -]+$",
  phone: "^\\+380\\d{9}$",
  email: "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
  trackingNumber: "^PL[A-Za-z0-9]{3,18}$",
  password: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*(),.?\":{}|<>_\\-\\[\\]/+=~`\\\\]).{8,64}$",
} as const;

const normalizeSpaces = (value: string) => value.replace(/\s+/g, ' ').trimStart();
const nameChars = /[^A-Za-zА-Яа-яІіЇїЄєҐґ' -]/g;
const addressChars = /[^0-9A-Za-zА-Яа-яІіЇїЄєҐґ'’.,№/\\ -]/g;

export const sanitizeName = (value: string, max: number = INPUT_LIMITS.nameMax) =>
  normalizeSpaces(value.replace(nameChars, '')).slice(0, max);

export const sanitizeCity = (value: string) =>
  sanitizeName(value, INPUT_LIMITS.cityMax);

export const sanitizeAddress = (value: string) =>
  normalizeSpaces(value.replace(addressChars, '')).slice(0, INPUT_LIMITS.addressMax);

export const sanitizeEmail = (value: string) => {
  const cleaned = value.toLowerCase().replace(/[^a-z0-9@._+-]/g, '').slice(0, INPUT_LIMITS.emailMax);
  const [localPart = '', ...domainParts] = cleaned.split('@');
  const domainPart = domainParts.join('');
  return domainParts.length ? `${localPart}@${domainPart}` : localPart;
};

export const sanitizeUaPhone = (value: string, allowEmpty = false) => {
  const digits = value.replace(/\D/g, '');
  if (allowEmpty && digits.length === 0) return '';

  const localDigits = digits.startsWith('380')
    ? digits.slice(3, 12)
    : digits.startsWith('0')
      ? digits.slice(1, 10)
      : digits.slice(0, 9);

  return `+380${localDigits}`;
};

export const sanitizeTrackingNumber = (value: string) =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, INPUT_LIMITS.trackingMax);

export const sanitizePlainText = (value: string, max: number = INPUT_LIMITS.noteMax) =>
  Array.from(value)
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code >= 32 && code !== 127;
    })
    .join('')
    .slice(0, max);

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
