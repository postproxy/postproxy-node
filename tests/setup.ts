import { PostProxy } from "../src/index.js";

export interface RecordedRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: unknown;
}

export function createMockClient(options: {
  responseBody?: unknown;
  responseStatus?: number;
  profileGroupId?: string;
}): { client: PostProxy; getRequests: () => RecordedRequest[] } {
  const requests: RecordedRequest[] = [];
  const { responseBody = {}, responseStatus = 200, profileGroupId } = options;

  const client = new PostProxy("test-api-key", {
    baseUrl: "https://mock.postproxy.dev",
    profileGroupId,
  });

  // Monkey-patch the request method to record calls and return mock data
  const originalRequest = client.request.bind(client);
  client.request = async (
    method: string,
    path: string,
    reqOptions: Record<string, unknown> = {},
  ): Promise<unknown> => {
    const url = new URL(`/api${path}`, "https://mock.postproxy.dev");
    const params = reqOptions.params as Record<string, string> | undefined;
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    }

    const pgId =
      (reqOptions.profileGroupId as string) ?? profileGroupId ?? null;
    if (pgId) {
      url.searchParams.set("profile_group_id", pgId);
    }

    const headers: Record<string, string> = {
      Authorization: "Bearer test-api-key",
    };
    if (reqOptions.idempotencyKey != null) {
      headers["Idempotency-Key"] = reqOptions.idempotencyKey as string;
    }

    requests.push({
      method,
      url: url.toString(),
      headers,
      body: reqOptions.json ?? reqOptions.formData ?? null,
    });

    if (responseStatus === 204) return null;

    if (responseStatus >= 400) {
      // Delegate to original to trigger error handling
      // But since we don't have a real server, simulate error
      const { PostProxyError, AuthenticationError, ConflictError, NotFoundError, ValidationError, BadRequestError } = await import("../src/exceptions.js");
      const msg = (responseBody as Record<string, string>)?.error ?? "Error";
      switch (responseStatus) {
        case 401: throw new AuthenticationError(msg, responseBody as Record<string, unknown>);
        case 404: throw new NotFoundError(msg, responseBody as Record<string, unknown>);
        case 409: throw new ConflictError(msg, responseBody as Record<string, unknown>);
        case 422: throw new ValidationError(msg, responseBody as Record<string, unknown>);
        case 400: throw new BadRequestError(msg, responseBody as Record<string, unknown>);
        default: throw new PostProxyError(msg, responseStatus, responseBody as Record<string, unknown>);
      }
    }

    return responseBody;
  };

  return { client, getRequests: () => requests };
}
