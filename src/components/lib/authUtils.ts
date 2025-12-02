export function isUnauthorizedError(error: any) {
  // لو فيه error.status === 401
  return error && error.status === 401;
} 