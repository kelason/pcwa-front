import { describe, expect, it, vi } from 'vitest';
import { ApiError, formatApiError, notifyUnauthorized, UNAUTHORIZED_EVENT } from './apiError';

describe('formatApiError', () => {
  it('passes through a string detail', () => {
    expect(formatApiError({ detail: 'Category still has products' })).toBe('Category still has products');
  });
  it('reads the first message from a FastAPI 422 detail list', () => {
    const body = { detail: [{ loc: ['body', 'price'], msg: 'Input should be greater than or equal to 0' }] };
    expect(formatApiError(body)).toContain('greater than or equal to 0');
  });
  it('falls back for unknown shapes', () => {
    expect(formatApiError(null)).toBe('Something went wrong. Please try again.');
    expect(formatApiError({})).toBe('Something went wrong. Please try again.');
  });
});

describe('notifyUnauthorized', () => {
  it('dispatches the unauthorized event only for 401 ApiErrors', () => {
    const listener = vi.fn();
    window.addEventListener(UNAUTHORIZED_EVENT, listener);
    notifyUnauthorized(new ApiError(401, 'expired'));
    expect(listener).toHaveBeenCalledTimes(1);
    notifyUnauthorized(new ApiError(500, 'boom'));
    notifyUnauthorized(new Error('plain'));
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener(UNAUTHORIZED_EVENT, listener);
  });
});
