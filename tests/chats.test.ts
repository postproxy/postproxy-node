import { describe, it, expect } from "vitest";
import { createMockClient } from "./setup.js";

const MOCK_CHAT = {
  id: "chat_xyz789",
  profile_id: "prof_abc123",
  platform: "instagram",
  participant_external_id: "igsid_8675309",
  participant_username: "jane_doe",
  participant_name: "Jane Doe",
  participant_avatar_url: "https://storage.postproxy.dev/x.jpg",
  external_conversation_id: null,
  last_inbound_at: "2026-05-31T14:02:00.000Z",
  last_outbound_at: "2026-05-31T15:10:00.000Z",
  last_message_at: "2026-05-31T15:10:00.000Z",
  metadata: { is_verified_user: false, follower_count: 482 },
  created_at: "2026-04-12T08:00:00.000Z",
};

describe("Chats Resource", () => {
  it("lists chats", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: { total: 1, page: 0, per_page: 20, data: [MOCK_CHAT] },
    });
    const result = await client.chats.list("prof_abc123", { perPage: 20 });
    expect(result.total).toBe(1);
    expect(result.data).toHaveLength(1);
    const chat = result.data[0];
    expect(chat.id).toBe("chat_xyz789");
    expect(chat.participant_username).toBe("jane_doe");
    expect((chat.metadata as Record<string, unknown>).follower_count).toBe(482);
    expect(getRequests()[0].method).toBe("GET");
    expect(getRequests()[0].url).toContain("/profiles/prof_abc123/chats");
    expect(getRequests()[0].url).toContain("per_page=20");
  });

  it("creates a chat", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: MOCK_CHAT,
    });
    const chat = await client.chats.create("prof_abc123", "igsid_8675309", {
      participantUsername: "jane_doe",
    });
    expect(chat.id).toBe("chat_xyz789");
    expect(getRequests()[0].method).toBe("POST");
    expect(getRequests()[0].url).toContain("/profiles/prof_abc123/chats");
    const body = getRequests()[0].body as Record<string, unknown>;
    expect(body.participant_external_id).toBe("igsid_8675309");
    expect(body.participant_username).toBe("jane_doe");
  });

  it("gets a chat", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: MOCK_CHAT,
    });
    const chat = await client.chats.get("chat_xyz789");
    expect(chat.id).toBe("chat_xyz789");
    expect(getRequests()[0].method).toBe("GET");
    expect(getRequests()[0].url).toContain("/chats/chat_xyz789");
  });

  it("archives a chat", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: { ...MOCK_CHAT, archived: true },
    });
    const chat = await client.chats.archive("chat_xyz789");
    expect(chat.archived).toBe(true);
    expect(getRequests()[0].method).toBe("POST");
    expect(getRequests()[0].url).toContain("/chats/chat_xyz789/archive");
  });

  it("unarchives a chat", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: { ...MOCK_CHAT, archived: false },
    });
    const chat = await client.chats.unarchive("chat_xyz789");
    expect(chat.archived).toBe(false);
    expect(getRequests()[0].method).toBe("DELETE");
    expect(getRequests()[0].url).toContain("/chats/chat_xyz789/archive");
  });
});
