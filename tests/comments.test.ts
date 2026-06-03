import { describe, it, expect } from "vitest";
import { createMockClient } from "./setup.js";

const MOCK_REPLY = {
  id: "cmt_def456",
  external_id: "17858893269123457",
  body: "Thanks!",
  status: "synced",
  author_username: "author",
  author_avatar_url: null,
  author_external_id: "67890",
  metadata: null,
  parent_external_id: "17858893269123456",
  like_count: 1,
  is_hidden: false,
  permalink: null,
  platform_data: null,
  attachments: [],
  posted_at: "2026-03-25T10:05:00Z",
  created_at: "2026-03-25T10:05:00Z",
  replies: [],
};

const MOCK_COMMENT = {
  id: "cmt_abc123",
  external_id: "17858893269123456",
  body: "Great post!",
  status: "synced",
  author_username: "someuser",
  author_avatar_url: null,
  author_external_id: "12345",
  metadata: null,
  parent_external_id: null,
  like_count: 3,
  is_hidden: false,
  permalink: null,
  platform_data: null,
  attachments: [],
  posted_at: "2026-03-25T10:00:00Z",
  created_at: "2026-03-25T10:01:00Z",
  replies: [MOCK_REPLY],
};

describe("Comments Resource", () => {
  it("lists comments", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: { total: 1, page: 0, per_page: 20, data: [MOCK_COMMENT] },
    });
    const result = await client.comments.list("post1", "prof1");
    expect(result.total).toBe(1);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe("cmt_abc123");
    expect(result.data[0].body).toBe("Great post!");
    expect(result.data[0].replies).toHaveLength(1);
    expect(getRequests()[0].method).toBe("GET");
    expect(getRequests()[0].url).toContain("/posts/post1/comments");
    expect(getRequests()[0].url).toContain("profile_id=prof1");
  });

  it("lists comments with pagination", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: { total: 42, page: 2, per_page: 10, data: [] },
    });
    const result = await client.comments.list("post1", "prof1", {
      page: 2,
      perPage: 10,
    });
    expect(result.total).toBe(42);
    expect(result.page).toBe(2);
    expect(getRequests()[0].url).toContain("page=2");
    expect(getRequests()[0].url).toContain("per_page=10");
  });

  it("gets a comment", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: MOCK_COMMENT,
    });
    const comment = await client.comments.get("post1", "cmt_abc123", "prof1");
    expect(comment.id).toBe("cmt_abc123");
    expect(comment.body).toBe("Great post!");
    expect(comment.replies).toHaveLength(1);
    expect(getRequests()[0].url).toContain("/posts/post1/comments/cmt_abc123");
    expect(getRequests()[0].url).toContain("profile_id=prof1");
  });

  it("creates a comment", async () => {
    const created = {
      ...MOCK_COMMENT,
      id: "cmt_new",
      external_id: null,
      body: "Nice!",
      status: "pending",
      replies: [],
    };
    const { client, getRequests } = createMockClient({
      responseBody: created,
    });
    const comment = await client.comments.create("post1", "prof1", "Nice!");
    expect(comment.id).toBe("cmt_new");
    expect(comment.status).toBe("pending");
    expect(getRequests()[0].method).toBe("POST");
    expect(getRequests()[0].url).toContain("profile_id=prof1");
    const body = getRequests()[0].body as Record<string, unknown>;
    expect(body.text).toBe("Nice!");
    expect(body.parent_id).toBeUndefined();
  });

  it("creates a reply", async () => {
    const reply = {
      ...MOCK_COMMENT,
      id: "cmt_reply",
      body: "Thanks!",
      status: "pending",
      replies: [],
    };
    const { client, getRequests } = createMockClient({
      responseBody: reply,
    });
    const comment = await client.comments.create("post1", "prof1", "Thanks!", {
      parentId: "cmt_abc123",
    });
    expect(comment.id).toBe("cmt_reply");
    const body = getRequests()[0].body as Record<string, unknown>;
    expect(body.text).toBe("Thanks!");
    expect(body.parent_id).toBe("cmt_abc123");
  });

  it("deletes a comment", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: { accepted: true },
    });
    const result = await client.comments.delete("post1", "cmt_abc123", "prof1");
    expect(result.accepted).toBe(true);
    expect(getRequests()[0].method).toBe("DELETE");
    expect(getRequests()[0].url).toContain("/posts/post1/comments/cmt_abc123");
  });

  it("hides a comment", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: { accepted: true },
    });
    const result = await client.comments.hide("post1", "cmt_abc123", "prof1");
    expect(result.accepted).toBe(true);
    expect(getRequests()[0].method).toBe("POST");
    expect(getRequests()[0].url).toContain("/comments/cmt_abc123/hide");
  });

  it("unhides a comment", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: { accepted: true },
    });
    const result = await client.comments.unhide("post1", "cmt_abc123", "prof1");
    expect(result.accepted).toBe(true);
    expect(getRequests()[0].url).toContain("/comments/cmt_abc123/unhide");
  });

  it("likes a comment", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: { accepted: true },
    });
    const result = await client.comments.like("post1", "cmt_abc123", "prof1");
    expect(result.accepted).toBe(true);
    expect(getRequests()[0].url).toContain("/comments/cmt_abc123/like");
  });

  it("unlikes a comment", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: { accepted: true },
    });
    const result = await client.comments.unlike("post1", "cmt_abc123", "prof1");
    expect(result.accepted).toBe(true);
    expect(getRequests()[0].url).toContain("/comments/cmt_abc123/unlike");
  });

  it("parses attachments and metadata", async () => {
    const comment = {
      ...MOCK_COMMENT,
      metadata: { is_verified_user: true, follower_count: 482 },
      attachments: [
        {
          id: "att_xyz321",
          type: "image",
          url: "https://storage.postproxy.dev/x",
          status: "processed",
          external_id: "529233764205652",
        },
      ],
    };
    const { client } = createMockClient({ responseBody: comment });
    const result = await client.comments.get("post1", "cmt_abc123", "prof1");
    expect((result.metadata as Record<string, unknown>).follower_count).toBe(482);
    expect(result.attachments).toHaveLength(1);
    expect(result.attachments[0].type).toBe("image");
    expect(result.attachments[0].status).toBe("processed");
  });

  it("sends a private reply (returns a Message)", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: {
        id: "msg_222",
        chat_id: "chat_xyz789",
        external_id: null,
        direction: "outbound",
        body: "DM-ing you the details.",
        status: "pending",
        tag: null,
        external_comment_id: "17858893269123456",
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
      },
    });
    const msg = await client.comments.privateReply(
      "post1",
      "cmt_abc123",
      "prof1",
      "DM-ing you the details.",
    );
    expect(msg.external_comment_id).toBe("17858893269123456");
    expect(msg.chat_id).toBe("chat_xyz789");
    expect(getRequests()[0].method).toBe("POST");
    expect(getRequests()[0].url).toContain(
      "/posts/post1/comments/cmt_abc123/private_reply",
    );
    expect(getRequests()[0].url).toContain("profile_id=prof1");
    const body = getRequests()[0].body as Record<string, unknown>;
    expect(body.text).toBe("DM-ing you the details.");
  });
});
