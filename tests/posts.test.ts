import { describe, it, expect } from "vitest";
import { createMockClient } from "./setup.js";

const MOCK_POST = {
  id: "post-1",
  body: "Hello world",
  status: "pending",
  scheduled_at: null,
  created_at: "2025-01-01T00:00:00Z",
  platforms: [],
};

const MOCK_PAGINATED = {
  total: 1,
  page: 0,
  per_page: 10,
  data: [MOCK_POST],
};

describe("Posts Resource", () => {
  it("lists posts with pagination", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: MOCK_PAGINATED,
    });
    const result = await client.posts.list({ page: 0, perPage: 10 });

    expect(result.total).toBe(1);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe("post-1");

    const url = getRequests()[0].url;
    expect(url).toContain("page=0");
    expect(url).toContain("per_page=10");
  });

  it("lists posts filtered by status", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: MOCK_PAGINATED,
    });
    await client.posts.list({ status: "draft" });
    expect(getRequests()[0].url).toContain("status=draft");
  });

  it("lists posts filtered by platforms", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: MOCK_PAGINATED,
    });
    await client.posts.list({ platforms: ["instagram", "tiktok"] });
    expect(getRequests()[0].url).toContain("platforms=instagram%2Ctiktok");
  });

  it("gets a post by id", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: MOCK_POST,
    });
    const post = await client.posts.get("post-1");
    expect(post.id).toBe("post-1");
    expect(post.body).toBe("Hello world");
    expect(getRequests()[0].url).toContain("/posts/post-1");
  });

  it("creates a post with JSON payload", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: MOCK_POST,
    });
    const post = await client.posts.create("Hello world", ["profile-1"], {
      media: ["https://example.com/image.jpg"],
    });

    expect(post.id).toBe("post-1");
    const body = getRequests()[0].body as Record<string, unknown>;
    expect(body.post).toEqual({ body: "Hello world" });
    expect(body.profiles).toEqual(["profile-1"]);
    expect(body.media).toEqual(["https://example.com/image.jpg"]);
  });

  it("creates a post with platform params", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: MOCK_POST,
    });
    await client.posts.create("Hello", ["profile-1"], {
      platforms: {
        instagram: { format: "reel", collaborators: ["user1"] },
        tiktok: { privacy_status: "PUBLIC_TO_EVERYONE" },
      },
    });

    const body = getRequests()[0].body as Record<string, unknown>;
    expect(body.platforms).toEqual({
      instagram: { format: "reel", collaborators: ["user1"] },
      tiktok: { privacy_status: "PUBLIC_TO_EVERYONE" },
    });
  });

  it("creates a scheduled post", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: MOCK_POST,
    });
    await client.posts.create("Hello", ["profile-1"], {
      scheduledAt: "2025-12-25T09:00:00Z",
    });

    const body = getRequests()[0].body as Record<string, unknown>;
    expect((body.post as Record<string, unknown>).scheduled_at).toBe(
      "2025-12-25T09:00:00Z",
    );
  });

  it("creates a draft post", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: { ...MOCK_POST, status: "draft" },
    });
    await client.posts.create("Hello", ["profile-1"], { draft: true });

    const body = getRequests()[0].body as Record<string, unknown>;
    expect((body.post as Record<string, unknown>).draft).toBe(true);
  });

  it("publishes a draft", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: { ...MOCK_POST, status: "pending" },
    });
    const post = await client.posts.publishDraft("post-1");
    expect(post.status).toBe("pending");
    expect(getRequests()[0].method).toBe("POST");
    expect(getRequests()[0].url).toContain("/posts/post-1/publish");
  });

  it("deletes a post", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: { deleted: true },
    });
    const result = await client.posts.delete("post-1");
    expect(result.deleted).toBe(true);
    expect(getRequests()[0].method).toBe("DELETE");
  });
});
