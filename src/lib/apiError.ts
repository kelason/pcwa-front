const FALLBACK = 'Something went wrong. Please try again.';

/** Turn a FastAPI error body ({ detail: string | [{msg}] }) into one readable line. */
export function formatApiError(body: unknown): string {
  if (!body || typeof body !== 'object') return FALLBACK;
  const detail = (body as { detail?: unknown }).detail;
  if (typeof detail === 'string' && detail.trim()) return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0] as { msg?: unknown };
    if (typeof first?.msg === 'string' && first.msg.trim()) return first.msg;
  }
  return FALLBACK;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const UNAUTHORIZED_EVENT = 'pcwa:unauthorized';

/** Broadcast a 401 so the page can drop the dead session and open login,
 * whoever caught the error (page handlers and modals alike). */
export function notifyUnauthorized(error: unknown): void {
  if (error instanceof ApiError && error.status === 401) {
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }
}

export async function throwIfNotOk(response: Response, action: string): Promise<void> {
  if (response.ok) return;
  const body = await response.json().catch(() => null);
  throw new ApiError(response.status, `${action}: ${formatApiError(body)}`);
}
