import { describe, it, expect } from "vitest";
import { createMockClient } from "./setup.js";
import { AuthenticationError, NotFoundError, ValidationError, BadRequestError } from "../src/index.js";

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
});
