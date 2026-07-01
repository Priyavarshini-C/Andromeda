// =============================================================================
// Andromeda — API Response Helpers
// =============================================================================

import { NextResponse } from "next/server";

export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "SERVER_ERROR";

export function successResponse<T>(data: T, meta?: Record<string, unknown> | null, status = 200) {
  return NextResponse.json(
    {
      data,
      ...(meta && { meta }),
    },
    { status }
  );
}

export function errorResponse(
  code: ErrorCode,
  message: string,
  status: number,
  details?: Record<string, string[]>
) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details && { details }),
      },
    },
    { status }
  );
}

export function unauthorized(message = "Missing or invalid authentication session") {
  return errorResponse("UNAUTHORIZED", message, 401);
}

export function forbidden(message = "Insufficient permissions for this resource") {
  return errorResponse("FORBIDDEN", message, 403);
}

export function notFound(message = "Resource not found") {
  return errorResponse("NOT_FOUND", message, 404);
}

export function conflict(message = "Resource state conflict") {
  return errorResponse("CONFLICT", message, 409);
}

export function validationError(details: Record<string, string[]>, message = "Validation failed") {
  return errorResponse("VALIDATION_ERROR", message, 422, details);
}

export function serverError(message = "An unexpected internal error occurred") {
  return errorResponse("SERVER_ERROR", message, 500);
}
