import { describe, expect, it } from 'vitest';
import { validateProductName, validateProductPrice } from './validation';

describe('validateProductName', () => {
  it('rejects empty name', () => {
    expect(validateProductName('   ')).toBe('Product name cannot be empty.');
  });
  it('rejects name over 25 characters', () => {
    expect(validateProductName('a'.repeat(26))).toBe('Product name must be between 1 and 25 characters.');
  });
  it('accepts a normal name', () => {
    expect(validateProductName('Mouse')).toBeNull();
  });
});

describe('validateProductPrice', () => {
  it('rejects empty price', () => {
    expect(validateProductPrice('')).toBe('Price cannot be empty.');
  });
  it('rejects zero and negative prices', () => {
    expect(validateProductPrice('0')).toMatch(/greater than 0/);
    expect(validateProductPrice('-3')).toMatch(/greater than 0/);
  });
  it('rejects non-numeric price', () => {
    expect(validateProductPrice('abc')).toMatch(/valid positive number/);
  });
  it('accepts a decimal price', () => {
    expect(validateProductPrice('19.99')).toBeNull();
  });
});
