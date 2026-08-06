import { describe, it, expect } from "vitest";
import { createMockClient } from "./setup.js";
import { ConflictError } from "../src/index.js";

const MOCK_PROFILE = {
  id: "prof-1",
  name: "Test Profile",
  status: "active",
  platform: "instagram",
  profile_group_id: "pg-1",
  expires_at: null,
  post_count: 5,
};

const MOCK_POST_SYNC = {
  id: "sync456def",
  profile_id: "prof-1",
  kind: "posts",
  trigger: "backfill",
  status: "running",
  started_at: "2026-08-06T09:15:02.000Z",
  completed_at: null,
  posts_seen: 150,
  posts_imported: 143,
  backfill_from: "2025-01-01T00:00:00.000Z",
  oldest_posted_at: "2025-11-04T18:22:00.000Z",
  error: null,
  created_at: "2026-08-06T09:15:00.000Z",
};

describe("Profiles Resource", () => {
  it("lists profiles", async () => {
    const { client } = createMockClient({
      responseBody: { data: [MOCK_PROFILE] },
    });
    const result = await client.profiles.list();
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe("prof-1");
    expect(result.data[0].platform).toBe("instagram");
  });

  it("gets a profile by id", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: MOCK_PROFILE,
    });
    const profile = await client.profiles.get("prof-1");
    expect(profile.name).toBe("Test Profile");
    expect(getRequests()[0].url).toContain("/profiles/prof-1");
  });

  it("gets placements for a profile", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: { data: [{ id: "pl-1", name: "Feed" }] },
    });
    const result = await client.profiles.placements("prof-1");
    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe("Feed");
    expect(getRequests()[0].url).toContain("/profiles/prof-1/placements");
  });

  it("assigns a placement to another group", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: {
        id: "pl-1",
        name: "Feed",
        metadata: {},
        profile_group_id: "pg-2",
      },
    });
    const result = await client.profiles.assignPlacementToGroup("prof-1", {
      placementId: "pl-1",
      targetProfileGroupId: "pg-2",
    });
    expect(result.profile_group_id).toBe("pg-2");
    const request = getRequests()[0];
    expect(request.method).toBe("PATCH");
    expect(request.url).toContain(
      "/profiles/prof-1/assign_placement_to_group",
    );
    expect(request.body).toEqual({
      placement_id: "pl-1",
      target_profile_group_id: "pg-2",
    });
  });

  it("lists ice breakers", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: {
        ice_breakers: [{ question: "What do you do?", payload: "services" }],
      },
    });
    const result = await client.profiles.iceBreakers("prof-1");
    expect(result.ice_breakers).toHaveLength(1);
    expect(result.ice_breakers[0].question).toBe("What do you do?");
    const request = getRequests()[0];
    expect(request.method).toBe("GET");
    expect(request.url).toContain("/profiles/prof-1/ice_breakers");
  });

  it("sets ice breakers", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: { success: true },
    });
    const result = await client.profiles.setIceBreakers("prof-1", [
      { question: "What do you do?", payload: "services" },
    ]);
    expect(result.success).toBe(true);
    const request = getRequests()[0];
    expect(request.method).toBe("POST");
    expect(request.url).toContain("/profiles/prof-1/ice_breakers");
    expect(request.body).toEqual({
      ice_breakers: [{ question: "What do you do?", payload: "services" }],
    });
  });

  it("deletes ice breakers", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: { success: true },
    });
    const result = await client.profiles.deleteIceBreakers("prof-1");
    expect(result.success).toBe(true);
    const request = getRequests()[0];
    expect(request.method).toBe("DELETE");
    expect(request.url).toContain("/profiles/prof-1/ice_breakers");
  });

  it("deletes a profile", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: { success: true },
    });
    const result = await client.profiles.delete("prof-1");
    expect(result.success).toBe(true);
    expect(getRequests()[0].method).toBe("DELETE");
  });

  it("starts a posts backfill", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: { ...MOCK_POST_SYNC, status: "pending" },
    });
    const sync = await client.profiles.backfillPosts("prof-1", {
      from: "2025-01-01",
    });

    expect(sync.id).toBe("sync456def");
    expect(sync.trigger).toBe("backfill");
    expect(sync.status).toBe("pending");

    const request = getRequests()[0];
    expect(request.method).toBe("POST");
    expect(request.url).toContain("/profiles/prof-1/backfill_posts");
    expect(request.body).toEqual({ from: "2025-01-01" });
  });

  it("passes an idempotency key when starting a backfill", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: MOCK_POST_SYNC,
    });
    await client.profiles.backfillPosts(
      "prof-1",
      { from: "2025-01-01" },
      { idempotencyKey: "key-1" },
    );
    expect(getRequests()[0].headers["Idempotency-Key"]).toBe("key-1");
  });

  it("throws ConflictError when a backfill is already running", async () => {
    const { client } = createMockClient({
      responseBody: {
        error: "A posts backfill is already running for this profile",
        profile_sync_id: "sync456def",
      },
      responseStatus: 409,
    });

    try {
      await client.profiles.backfillPosts("prof-1", { from: "2025-01-01" });
      expect.unreachable("expected a ConflictError");
    } catch (error) {
      expect(error).toBeInstanceOf(ConflictError);
      expect((error as ConflictError).response?.profile_sync_id).toBe(
        "sync456def",
      );
    }
  });

  it("lists post syncs with filters", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: {
        total: 1,
        page: 0,
        per_page: 25,
        data: [MOCK_POST_SYNC],
      },
    });
    const result = await client.profiles.postSyncs("prof-1", {
      trigger: "backfill",
      status: "running",
      page: 0,
      perPage: 25,
    });

    expect(result.total).toBe(1);
    expect(result.data[0].posts_imported).toBe(143);
    expect(result.data[0].oldest_posted_at).toBe("2025-11-04T18:22:00.000Z");

    const url = getRequests()[0].url;
    expect(url).toContain("/profiles/prof-1/post_syncs");
    expect(url).toContain("trigger=backfill");
    expect(url).toContain("status=running");
    expect(url).toContain("per_page=25");
  });

  it("gets a single post sync", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: { ...MOCK_POST_SYNC, status: "completed" },
    });
    const sync = await client.profiles.postSync("prof-1", "sync456def");

    expect(sync.status).toBe("completed");
    expect(getRequests()[0].url).toContain(
      "/profiles/prof-1/post_syncs/sync456def",
    );
  });
});
