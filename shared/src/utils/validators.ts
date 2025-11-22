import { z } from 'zod';

// Email validation
export const isValidEmail = (email: string): boolean => {
  return z.string().email().safeParse(email).success;
};

// Password strength validation
export const isStrongPassword = (password: string): boolean => {
  const schema = z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number');

  return schema.safeParse(password).success;
};

// Ethereum address validation
export const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Tron address validation
export const isValidTronAddress = (address: string): boolean => {
  return /^T[A-Za-z1-9]{33}$/.test(address);
};

// URL validation
export const isValidUrl = (url: string): boolean => {
  return z.string().url().safeParse(url).success;
};

// Phone number validation (international format)
export const isValidPhoneNumber = (phone: string): boolean => {
  return /^\+?[1-9]\d{1,14}$/.test(phone);
};

// Username validation (alphanumeric, underscore, hyphen)
export const isValidUsername = (username: string): boolean => {
  return /^[a-zA-Z0-9_-]{3,20}$/.test(username);
};

// Sanitize string (remove HTML tags)
export const sanitizeString = (str: string): string => {
  return str.replace(/<[^>]*>/g, '');
};

// Truncate string
export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
};
