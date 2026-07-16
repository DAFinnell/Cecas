/**
 * Represents the structured RFC 7807 ProblemDetail payload returned by our Java backend.
 */
export interface ApiProblemDetail {
    title: string;
    status: number;
    detail: string;
    errorCode?: string;
    errors?: Record<string, string>;
}

/**
 * The standardized error format that our frontend hooks and UI pages will see.
 */
export interface NormalizedError {
    message: string;
    errorCode: string;
    fieldErrors: Record<string, string>;
}

export async function parseApiError(error: unknown): Promise<NormalizedError> {
  const fallback: NormalizedError = {
    message: 'An unexpected error occurred. Please try again.',
    errorCode: 'UNKNOWN_ERROR',
    fieldErrors: {}
  };

  if (error instanceof Response) {
    const contentType = error.headers.get('content-type') ?? '';
    const statusAndCode = `HTTP_${error.status}`;

    if (contentType.includes('application/json')) {
      try {
        const responseData: ApiProblemDetail = await error.json();
        return {
          message: responseData.detail || responseData.title || fallback.message,
          errorCode: responseData.errorCode || statusAndCode,
          fieldErrors: responseData.errors || {}
        };
      } catch {
        // Fall through if text reading fails
      }
    }

    try {
      const textMessage = await error.text();
      if (textMessage && textMessage.trim().length > 0) {
        return {
          message: textMessage,
          errorCode: statusAndCode,
          fieldErrors: {}
        };
      }
    } catch {
      // Fall through if text reading fails
    }

    return {
      ...fallback,
      message: `Network request failed with status ${error.status}.`,
      errorCode: statusAndCode
    };
  }

  if (error instanceof Error) {
    return { ...fallback, message: error.message };
  }

  return fallback;
}