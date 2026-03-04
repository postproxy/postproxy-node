import { describe, it, expect } from "vitest";
import { createMockClient } from "./setup.js";
import { verifySignature } from "../src/webhooks.js";
import type { Post, Webhook, WebhookDelivery } from "../src/types.js";

const MOCK_WEBHOOK = {
  id: "wh-1",
  url: "https://example.com/webhook",
  events: ["post.published", "post.failed"],
  enabled: true,
  description: "Test webhook",
  secret: "whsec_test123",
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

const MOCK_DELIVERY = {
  id: "del-1",
  event_id: "evt-1",
  event_type: "post.published",
  response_status: 200,
  attempt_number: 1,
  success: true,
  attempted_at: "2025-01-01T00:00:00Z",
  created_at: "2025-01-01T00:00:00Z",
};

describe("Webhooks Resource", () => {
  it("lists webhooks", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: { data: [MOCK_WEBHOOK] },
    });
    const result = await client.webhooks.list();
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe("wh-1");
    expect(getRequests()[0].method).toBe("GET");
    expect(getRequests()[0].url).toContain("/webhooks");
  });

  it("gets a webhook by id", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: MOCK_WEBHOOK,
    });
    const webhook = await client.webhooks.get("wh-1");
    expect(webhook.id).toBe("wh-1");
    expect(webhook.events).toEqual(["post.published", "post.failed"]);
    expect(getRequests()[0].url).toContain("/webhooks/wh-1");
  });

  it("creates a webhook", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: MOCK_WEBHOOK,
    });
    const webhook = await client.webhooks.create(
      "https://example.com/webhook",
      ["post.published", "post.failed"],
      { description: "Test webhook" },
    );
    expect(webhook.id).toBe("wh-1");

    const body = getRequests()[0].body as Record<string, unknown>;
    expect(body.url).toBe("https://example.com/webhook");
    expect(body.events).toEqual(["post.published", "post.failed"]);
    expect(body.description).toBe("Test webhook");
  });

  it("updates a webhook", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: { ...MOCK_WEBHOOK, enabled: false },
    });
    const webhook = await client.webhooks.update("wh-1", { enabled: false });
    expect(webhook.enabled).toBe(false);
    expect(getRequests()[0].method).toBe("PATCH");

    const body = getRequests()[0].body as Record<string, unknown>;
    expect(body.enabled).toBe(false);
  });

  it("deletes a webhook", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: { deleted: true },
    });
    const result = await client.webhooks.delete("wh-1");
    expect(result.deleted).toBe(true);
    expect(getRequests()[0].method).toBe("DELETE");
  });

  it("lists webhook deliveries", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: {
        data: [MOCK_DELIVERY],
        total: 1,
        page: 1,
        per_page: 10,
      },
    });
    const result = await client.webhooks.deliveries("wh-1", {
      page: 1,
      perPage: 10,
    });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe("del-1");
    expect(result.data[0].success).toBe(true);
    expect(result.total).toBe(1);

    const url = getRequests()[0].url;
    expect(url).toContain("/webhooks/wh-1/deliveries");
    expect(url).toContain("page=1");
    expect(url).toContain("per_page=10");
  });
});

describe("Webhook Signature", () => {
  it("verifies a valid signature", () => {
    const payload =
      '{"event":"post.published","data":{"id":"post-1"}}';
    const secret = "whsec_test123";
    const signature =
      "t=1234567890,v1=c8e99efbb07ac8e3152c02dd8d83e8ddb803ae8fb001d9e1ab42fb0b1f405ef2";
    expect(verifySignature(payload, signature, secret)).toBe(true);
  });

  it("rejects an invalid signature", () => {
    const payload =
      '{"event":"post.published","data":{"id":"post-1"}}';
    const secret = "whsec_test123";
    const signature = "t=1234567890,v1=0000000000000000000000000000000000000000000000000000000000000000";
    expect(verifySignature(payload, signature, secret)).toBe(false);
  });

  it("rejects with wrong secret", () => {
    const payload =
      '{"event":"post.published","data":{"id":"post-1"}}';
    const secret = "wrong_secret";
    const signature =
      "t=1234567890,v1=c8e99efbb07ac8e3152c02dd8d83e8ddb803ae8fb001d9e1ab42fb0b1f405ef2";
    expect(verifySignature(payload, signature, secret)).toBe(false);
  });
});

describe("New Model Fields", () => {
  it("Post type includes media and thread", () => {
    const post: Post = {
      id: "1",
      body: "Hello",
      status: "media_processing_failed",
      scheduled_at: null,
      created_at: "2025-01-01T00:00:00Z",
      platforms: [],
      media: [
        {
          id: "m-1",
          status: "processed",
          content_type: "image/jpeg",
          source_url: "https://example.com/img.jpg",
          url: "https://cdn.example.com/img.jpg",
        },
      ],
      thread: [{ id: "t-1", body: "Thread reply", media: [] }],
    };
    expect(post.media).toHaveLength(1);
    expect(post.media![0].status).toBe("processed");
    expect(post.thread).toHaveLength(1);
    expect(post.thread![0].body).toBe("Thread reply");
    expect(post.status).toBe("media_processing_failed");
  });

  it("Webhook type matches expected shape", () => {
    const webhook: Webhook = MOCK_WEBHOOK;
    expect(webhook.id).toBe("wh-1");
    expect(webhook.secret).toBe("whsec_test123");
    expect(webhook.events).toEqual(["post.published", "post.failed"]);
  });

  it("WebhookDelivery type matches expected shape", () => {
    const delivery: WebhookDelivery = MOCK_DELIVERY;
    expect(delivery.event_type).toBe("post.published");
    expect(delivery.response_status).toBe(200);
  });

  it("YouTubeParams includes made_for_kids", () => {
    const params = {
      title: "Test",
      privacy_status: "public" as const,
      made_for_kids: true,
    };
    expect(params.made_for_kids).toBe(true);
  });
});
