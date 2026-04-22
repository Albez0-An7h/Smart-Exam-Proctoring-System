import { Request } from 'express';

export function getAuthenticatedUser(req: Request): NonNullable<Request['user']> {
  if (!req.user) {
    throw new Error('Not authenticated');
  }
  return req.user;
}

export function getErrorMessage(error: unknown, fallback = 'Internal server error'): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
