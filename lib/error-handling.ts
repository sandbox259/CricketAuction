export class AuctionError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode = 400,
  ) {
    super(message)
    this.name = "AuctionError"
  }
}

export class ValidationError extends AuctionError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", 400)
  }
}

export class AuthenticationError extends AuctionError {
  constructor(message = "Authentication required") {
    super(message, "AUTH_ERROR", 401)
  }
}

export class AuthorizationError extends AuctionError {
  constructor(message = "Insufficient permissions") {
    super(message, "AUTHORIZATION_ERROR", 403)
  }
}

export class RateLimitError extends AuctionError {
  constructor(message = "Too many requests") {
    super(message, "RATE_LIMIT_ERROR", 429)
  }
}

export class DatabaseError extends AuctionError {
  constructor(message = "Database operation failed") {
    super(message, "DATABASE_ERROR", 500)
  }
}

// Error handler for API routes
export function handleApiError(error: unknown): { error: string; statusCode: number } {
  console.error("API Error:", error)

  if (error instanceof AuctionError) {
    return {
      error: error.message,
      statusCode: error.statusCode,
    }
  }

  if (error instanceof Error) {
    return {
      error: "An unexpected error occurred",
      statusCode: 500,
    }
  }

  return {
    error: "Unknown error occurred",
    statusCode: 500,
  }
}

// Safe async function wrapper
export function safeAsync<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
): (...args: T) => Promise<{ data?: R; error?: string }> {
  return async (...args: T) => {
    try {
      const data = await fn(...args)
      return { data }
    } catch (error) {
      const { error: errorMessage } = handleApiError(error)
      return { error: errorMessage }
    }
  }
}
