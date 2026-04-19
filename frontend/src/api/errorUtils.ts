/**
 * Extracts a human-readable error message from any error shape:
 * - Axios HTTP error with { error: string } response data
 * - Axios network error (CORS block, no internet, etc.)
 * - Plain Error objects
 * - Unknown thrown values
 */
export function extractError(err: unknown, fallback = 'Something went wrong.'): string {
  if (!err) return fallback;

  // Axios-style error with HTTP response
  const axiosErr = err as any;
  if (axiosErr?.response?.data) {
    const data = axiosErr.response.data;
    if (typeof data.error === 'string' && data.error) return data.error;
    if (typeof data.message === 'string' && data.message) return data.message;
    if (typeof data === 'string' && data) return data;
  }

  // Network/CORS error — response is null but there's a message
  if (axiosErr?.message && typeof axiosErr.message === 'string') {
    if (axiosErr.message === 'Network Error') return 'Cannot reach server. Check your connection or CORS settings.';
    return axiosErr.message;
  }

  // Plain Error
  if (err instanceof Error) return err.message;

  return fallback;
}
