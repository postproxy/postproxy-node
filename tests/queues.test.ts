import { describe, it, expect } from "vitest";
import { createMockClient } from "./setup.js";

const MOCK_QUEUE = {
  id: "q1abc",
  name: "Morning Posts",
  description: "Daily morning content",
  timezone: "America/New_York",
  enabled: true,
  jitter: 10,
  profile_group_id: "pg123",
  timeslots: [
    { id: 1, day: 1, time: "09:00" },
    { id: 2, day: 3, time: "09:00" },
    { id: 3, day: 5, time: "14:00" },
  ],
  posts_count: 5,
};

describe("Queues Resource", () => {
  it("lists queues", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: { data: [MOCK_QUEUE] },
    });
    const result = await client.queues.list();
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe("q1abc");
    expect(result.data[0].timeslots).toHaveLength(3);
    expect(getRequests()[0].method).toBe("GET");
    expect(getRequests()[0].url).toContain("/post_queues");
  });

  it("lists queues with profile group override", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: { data: [] },
    });
    await client.queues.list({ profileGroupId: "pg-other" });
    expect(getRequests()[0].url).toContain("profile_group_id=pg-other");
  });

  it("gets a queue by id", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: MOCK_QUEUE,
    });
    const queue = await client.queues.get("q1abc");
    expect(queue.id).toBe("q1abc");
    expect(queue.name).toBe("Morning Posts");
    expect(queue.enabled).toBe(true);
    expect(queue.jitter).toBe(10);
    expect(queue.timeslots).toHaveLength(3);
    expect(getRequests()[0].url).toContain("/post_queues/q1abc");
  });

  it("gets next slot", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: { next_slot: "2026-03-11T14:00:00Z" },
    });
    const result = await client.queues.nextSlot("q1abc");
    expect(result.next_slot).toBe("2026-03-11T14:00:00Z");
    expect(getRequests()[0].url).toContain("/post_queues/q1abc/next_slot");
  });

  it("creates a queue with timeslots", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: MOCK_QUEUE,
    });
    const queue = await client.queues.create("Morning Posts", "pg123", {
      description: "Daily morning content",
      timezone: "America/New_York",
      jitter: 10,
      timeslots: [
        { day: 1, time: "09:00" },
        { day: 3, time: "09:00" },
      ],
    });
    expect(queue.id).toBe("q1abc");

    const body = getRequests()[0].body as Record<string, unknown>;
    expect(body.profile_group_id).toBe("pg123");
    const postQueue = body.post_queue as Record<string, unknown>;
    expect(postQueue.name).toBe("Morning Posts");
    expect(postQueue.timezone).toBe("America/New_York");
    expect(postQueue.jitter).toBe(10);
    expect(postQueue.queue_timeslots_attributes).toEqual([
      { day: 1, time: "09:00" },
      { day: 3, time: "09:00" },
    ]);
  });

  it("updates a queue", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: { ...MOCK_QUEUE, enabled: false },
    });
    const queue = await client.queues.update("q1abc", { enabled: false });
    expect(queue.enabled).toBe(false);
    expect(getRequests()[0].method).toBe("PATCH");

    const body = getRequests()[0].body as Record<string, unknown>;
    const postQueue = body.post_queue as Record<string, unknown>;
    expect(postQueue.enabled).toBe(false);
  });

  it("updates a queue with timeslot changes", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: MOCK_QUEUE,
    });
    await client.queues.update("q1abc", {
      timeslots: [
        { day: 2, time: "10:00" },
        { id: 1, _destroy: true },
      ],
    });

    const body = getRequests()[0].body as Record<string, unknown>;
    const postQueue = body.post_queue as Record<string, unknown>;
    expect(postQueue.queue_timeslots_attributes).toEqual([
      { day: 2, time: "10:00" },
      { id: 1, _destroy: true },
    ]);
  });

  it("deletes a queue", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: { deleted: true },
    });
    const result = await client.queues.delete("q1abc");
    expect(result.deleted).toBe(true);
    expect(getRequests()[0].method).toBe("DELETE");
    expect(getRequests()[0].url).toContain("/post_queues/q1abc");
  });
});
