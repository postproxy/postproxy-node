export class PostProxyError extends Error {
  statusCode: number;
  response: Record<string, unknown> | null;

  constructor(
    message: string,
    statusCode: number,
    response: Record<string, unknown> | null = null,
  ) {
    super(message);
    this.name = "PostProxyError";
    this.statusCode = statusCode;
    this.response = response;
  }
}

export class AuthenticationError extends PostProxyError {
  constructor(
    message: string,
    response: Record<string, unknown> | null = null,
  ) {
    super(message, 401, response);
    this.name = "AuthenticationError";
  }
}

export class NotFoundError extends PostProxyError {
  constructor(
    message: string,
    response: Record<string, unknown> | null = null,
  ) {
    super(message, 404, response);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends PostProxyError {
  constructor(
    message: string,
    response: Record<string, unknown> | null = null,
  ) {
    super(message, 422, response);
    this.name = "ValidationError";
  }
}

export class BadRequestError extends PostProxyError {
  constructor(
    message: string,
    response: Record<string, unknown> | null = null,
  ) {
    super(message, 400, response);
    this.name = "BadRequestError";
  }
}
