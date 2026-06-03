import { describe, it, expect } from "vitest";
import { createMockClient } from "./setup.js";

const MOCK_INBOUND = {
  id: "msg_111",
  chat_id: "chat_xyz789",
  external_id: "mid.abc123",
  direction: "inbound",
  body: "Hey, do you ship internationally?",
  status: "received",
  tag: null,
  external_comment_id: null,
  error_message: null,
  platform_data: null,
  external_posted_at: "2026-05-31T14:02:00.000Z",
  external_delivered_at: null,
  external_read_at: null,
  external_edited_at: null,
  reply_to_external_id: null,
  reply_markup: null,
  external_deleted_at: null,
  reactions: [
    {
      sender_external_id: "psid_123",
      emoji: "❤️",
      reaction: "love",
      at: "2026-05-31T14:04:00.000Z",
    },
  ],
  attachments: [],
  is_unsupported: false,
  created_at: "2026-05-31T14:02:01.000Z",
};

const MOCK_OUTBOUND = {
  id: "msg_222",
  chat_id: "chat_xyz789",
  external_id: null,
  direction: "outbound",
  body: "Yes, we ship worldwide!",
  status: "pending",
  tag: null,
  external_comment_id: null,
  error_message: null,
  platform_data: null,
  external_posted_at: null,
  external_delivered_at: null,
  external_read_at: null,
  external_edited_at: null,
  reply_to_external_id: null,
  reply_markup: null,
  external_deleted_at: null,
  reactions: [],
  attachments: [],
  is_unsupported: false,
  created_at: "2026-05-31T15:30:05.000Z",
};

describe("Messages Resource", () => {
  it("lists messages", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: { total: 1, page: 0, per_page: 20, data: [MOCK_INBOUND] },
    });
    const result = await client.messages.list("chat_xyz789", {
      direction: "inbound",
    });
    expect(result.total).toBe(1);
    const msg = result.data[0];
    expect(msg.direction).toBe("inbound");
    expect(msg.reactions[0].reaction).toBe("love");
    expect(getRequests()[0].method).toBe("GET");
    expect(getRequests()[0].url).toContain("/chats/chat_xyz789/messages");
    expect(getRequests()[0].url).toContain("direction=inbound");
  });

  it("sends a text message", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: MOCK_OUTBOUND,
    });
    const msg = await client.messages.send("chat_xyz789", {
      body: "Yes, we ship worldwide!",
    });
    expect(msg.id).toBe("msg_222");
    expect(msg.status).toBe("pending");
    expect(getRequests()[0].method).toBe("POST");
    expect(getRequests()[0].url).toContain("/chats/chat_xyz789/messages");
    const body = getRequests()[0].body as Record<string, unknown>;
    expect(body.body).toBe("Yes, we ship worldwide!");
  });

  it("sends a message with a tag", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: MOCK_OUTBOUND,
    });
    await client.messages.send("chat_xyz789", {
      body: "Following up.",
      tag: "HUMAN_AGENT",
    });
    const body = getRequests()[0].body as Record<string, unknown>;
    expect(body.tag).toBe("HUMAN_AGENT");
  });

  it("sends a media message by URL", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: MOCK_OUTBOUND,
    });
    await client.messages.send("chat_xyz789", {
      media: ["https://cdn.example.com/photo.png"],
    });
    const body = getRequests()[0].body as Record<string, unknown>;
    expect(body.media).toEqual(["https://cdn.example.com/photo.png"]);
  });

  it("sends a media message from local file via multipart", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: MOCK_OUTBOUND,
    });
    await client.messages.send("chat_xyz789", {
      body: "Here you go",
      mediaFiles: [new URL("./setup.ts", import.meta.url).pathname],
    });
    const body = getRequests()[0].body;
    expect(body).toBeInstanceOf(FormData);
    const fd = body as FormData;
    expect(fd.get("body")).toBe("Here you go");
    expect(fd.getAll("media[]")).toHaveLength(1);
  });

  it("gets a message", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: MOCK_INBOUND,
    });
    const msg = await client.messages.get("msg_111");
    expect(msg.id).toBe("msg_111");
    expect(getRequests()[0].url).toContain("/messages/msg_111");
  });

  it("edits a message", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: { ...MOCK_OUTBOUND, body: "Updated" },
    });
    const msg = await client.messages.edit("msg_222", { body: "Updated" });
    expect(msg.body).toBe("Updated");
    expect(getRequests()[0].method).toBe("PATCH");
    const body = getRequests()[0].body as Record<string, unknown>;
    expect(body.body).toBe("Updated");
  });

  it("reacts to a message", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: MOCK_INBOUND,
    });
    const msg = await client.messages.react("msg_111", {
      reaction: "love",
      emoji: "❤️",
    });
    expect(msg.id).toBe("msg_111");
    expect(getRequests()[0].method).toBe("POST");
    expect(getRequests()[0].url).toContain("/messages/msg_111/react");
    const body = getRequests()[0].body as Record<string, unknown>;
    expect(body.reaction).toBe("love");
  });

  it("unreacts to a message", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: MOCK_INBOUND,
    });
    const msg = await client.messages.unreact("msg_111");
    expect(msg.id).toBe("msg_111");
    expect(getRequests()[0].method).toBe("DELETE");
    expect(getRequests()[0].url).toContain("/messages/msg_111/unreact");
  });
});
