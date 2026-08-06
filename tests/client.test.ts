import { describe, it, expect } from "vitest";
import { createMockClient } from "./setup.js";
import { afterEach, vi } from "vitest";
import { PostProxy, AuthenticationError, ConflictError, NotFoundError, ValidationError, BadRequestError } from "../src/index.js";

describe("PostProxy Client", () => {
  it("sends authorization header", async () => {
    const { client, getRequests } = createMockClient({ responseBody: [] });
    await client.profiles.list();
    expect(getRequests()[0].headers.Authorization).toBe("Bearer test-api-key");
  });

  it("includes default profile_group_id", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: [],
      profileGroupId: "pg-123",
    });
    await client.profiles.list();
    expect(getRequests()[0].url).toContain("profile_group_id=pg-123");
  });

  it("allows overriding profile_group_id per request", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: [],
      profileGroupId: "pg-default",
    });
    await client.profiles.list({ profileGroupId: "pg-override" });
    expect(getRequests()[0].url).toContain("profile_group_id=pg-override");
  });

  it("throws AuthenticationError on 401", async () => {
    const { client } = createMockClient({
      responseBody: { error: "Invalid API key" },
      responseStatus: 401,
    });
    await expect(client.profiles.list()).rejects.toThrow(AuthenticationError);
  });

  it("throws NotFoundError on 404", async () => {
    const { client } = createMockClient({
      responseBody: { error: "Not found" },
      responseStatus: 404,
    });
    await expect(client.profiles.get("bad-id")).rejects.toThrow(NotFoundError);
  });

  it("throws ValidationError on 422", async () => {
    const { client } = createMockClient({
      responseBody: { error: "Validation failed" },
      responseStatus: 422,
    });
    await expect(
      client.posts.create("test", ["profile-1"]),
    ).rejects.toThrow(ValidationError);
  });

  it("throws BadRequestError on 400", async () => {
    const { client } = createMockClient({
      responseBody: { error: "Bad request" },
      responseStatus: 400,
    });
    await expect(
      client.posts.create("test", ["profile-1"]),
    ).rejects.toThrow(BadRequestError);
  });

  it("throws ConflictError on 409 and keeps the response body", async () => {
    const { client } = createMockClient({
      responseBody: {
        error: "Duplicate post",
        duplicate_post_id: "post-1",
      },
      responseStatus: 409,
    });

    await expect(
      client.posts.create("test", ["profile-1"]),
    ).rejects.toThrow(ConflictError);

    try {
      await client.posts.create("test", ["profile-1"]);
    } catch (error) {
      expect((error as ConflictError).statusCode).toBe(409);
      expect((error as ConflictError).response?.duplicate_post_id).toBe(
        "post-1",
      );
    }
  });
});

describe("Idempotency-Key", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function stubFetch() {
    return vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));
  }

  it("sends the header when a key is passed to a write method", async () => {
    const fetchSpy = stubFetch();
    const client = new PostProxy("test-api-key", {
      baseUrl: "https://mock.postproxy.dev",
    });

    await client.posts.create("hello", ["profile-1"], {
      idempotencyKey: "3f8b1c94-6a2d-4f0e-9d31-7c5e2a8b4f10",
    });

    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers["Idempotency-Key"]).toBe(
      "3f8b1c94-6a2d-4f0e-9d31-7c5e2a8b4f10",
    );
  });

  it("omits the header when no key is passed", async () => {
    const fetchSpy = stubFetch();
    const client = new PostProxy("test-api-key", {
      baseUrl: "https://mock.postproxy.dev",
    });

    await client.posts.create("hello", ["profile-1"]);

    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers["Idempotency-Key"]).toBeUndefined();
  });

  it("sends the header on multipart requests too", async () => {
    const fetchSpy = stubFetch();
    const client = new PostProxy("test-api-key", {
      baseUrl: "https://mock.postproxy.dev",
    });

    await client.messages.send("chat-1", {
      body: "hi",
      idempotencyKey: "key-123",
    });

    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers["Idempotency-Key"]).toBe("key-123");
  });
});
