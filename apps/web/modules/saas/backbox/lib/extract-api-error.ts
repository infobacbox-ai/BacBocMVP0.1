import { type ApiError, ERROR_CODES, type ErrorCode } from "@repo/shared";

/**
 * Extract ApiError from an unknown error (typically from oRPC/TanStack Query)
 * Returns null if the error doesn't match the expected structure
 */
export function extractApiError(error: unknown): ApiError | null {
	// Handle ORPCError structure
	if (error && typeof error === "object") {
		// Check for ORPCError with data containing our error structure
		if ("data" in error && error.data && typeof error.data === "object") {
			const data = error.data as Record<string, unknown>;
			if (isValidErrorCode(data.errorCode)) {
				return {
					status: (data.status as ApiError["status"]) ?? 500,
					errorCode: data.errorCode,
					message: (data.message as string) ?? "An error occurred",
					details: data.details as
						| Record<string, unknown>
						| undefined,
				};
			}
		}

		// Check for direct ApiError structure
		if ("errorCode" in error) {
			const err = error as Record<string, unknown>;
			if (isValidErrorCode(err.errorCode)) {
				return {
					status: (err.status as ApiError["status"]) ?? 500,
					errorCode: err.errorCode,
					message: (err.message as string) ?? "An error occurred",
					details: err.details as Record<string, unknown> | undefined,
				};
			}
		}
	}

	return null;
}

function isValidErrorCode(code: unknown): code is ErrorCode {
	return (
		typeof code === "string" &&
		Object.values(ERROR_CODES).includes(code as ErrorCode)
	);
}

/**
 * Get a fallback ApiError for unknown errors
 */
export function getFallbackError(message?: string): ApiError {
	return {
		status: 500,
		errorCode: ERROR_CODES.INTERNAL_ERROR,
		message: message ?? "An unexpected error occurred",
	};
}
