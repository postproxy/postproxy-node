import { describe, expect, it } from "vitest";
import { parseWebhookEvent, WebhookParseError } from "../src/index.js";
import type {
  PlatformPostData,
  PlatformPostInsightsData,
  PostProcessedData,
  PostImportedData,
  ProfileEventData,
  ProfileStatsData,
  MediaFailedData,
  CommentCreatedData,
  Message,
  MessageEventData,
  ReactionEventData,
  ProfileCommentCreatedData,
} from "../src/index.js";

const envelope = <T>(type: string, data: T) => ({
  id: "evt_1",
  type,
  created_at: "2026-05-12T00:00:00Z",
  data,
});

const mockMessage = (overrides: Partial<Message> = {}): Message => ({
  id: "msg_1",
  chat_id: "chat_1",
  external_id: "mid.1",
  direction: "inbound",
  body: "hi",
  status: "received",
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
  created_at: "2026-06-01T00:00:00Z",
  ...overrides,
});

describe("parseWebhookEvent", () => {
  it("parses post.processed", () => {
    const e = parseWebhookEvent(
      JSON.stringify(
        envelope<PostProcessedData>("post.processed", {
          id: "p1",
          body: "hi",
          status: "processed",
          scheduled_at: null,
          created_at: "2026-05-12T00:00:00Z",
          platforms: [{ id: "pf1", platform: "twitter", name: "X" }],
        }),
      ),
    );
    if (e.type !== "post.processed") throw new Error("wrong narrowing");
    expect(e.data.body).toBe("hi");
  });

  it("parses post.imported", () => {
    const e = parseWebhookEvent(
      envelope<PostImportedData>("post.imported", {
        id: "p1",
        body: "imported",
        source: "imported",
        posted_at: "2026-05-11T00:00:00Z",
        created_at: "2026-05-12T00:00:00Z",
        platform: "instagram",
        profile: { id: "pf1", name: "Acme", platform: "instagram" },
        platform_post_id: "ig123",
        public_id: "DEF",
      }),
    );
    if (e.type !== "post.imported") throw new Error("wrong narrowing");
    expect(e.data.platform_post_id).toBe("ig123");
  });

  it("parses platform_post.published", () => {
    const e = parseWebhookEvent(
      envelope<PlatformPostData>("platform_post.published", {
        id: "pp1",
        post_id: "p1",
        platform: "twitter",
        profile_id: "pf1",
        profile_name: "X",
        status: "published",
        error: null,
        error_details: null,
        platform_id: "tw_999",
      }),
    );
    if (e.type !== "platform_post.published") throw new Error("wrong narrowing");
    expect(e.data.platform_id).toBe("tw_999");
  });

  it("parses platform_post.failed and failed_waiting_for_retry", () => {
    for (const type of [
      "platform_post.failed",
      "platform_post.failed_waiting_for_retry",
    ] as const) {
      const e = parseWebhookEvent(
        envelope<PlatformPostData>(type, {
          id: "pp1",
          post_id: "p1",
          platform: "twitter",
          profile_id: "pf1",
          profile_name: "X",
          status: "failed",
          error: "oops",
          error_details: null,
          platform_id: null,
        }),
      );
      expect(e.type).toBe(type);
    }
  });

  it("parses platform_post.insights", () => {
    const e = parseWebhookEvent(
      envelope<PlatformPostInsightsData>("platform_post.insights", {
        id: "pp1",
        post_id: "p1",
        platform: "twitter",
        profile_id: "pf1",
        profile_name: "X",
        status: "published",
        error: null,
        error_details: null,
        platform_id: "tw_999",
        insights: { impressions: 100, likes: 5 },
      }),
    );
    if (e.type !== "platform_post.insights") throw new Error("wrong narrowing");
    expect(e.data.insights.impressions).toBe(100);
  });

  it("parses profile.connected and profile.disconnected", () => {
    for (const type of ["profile.connected", "profile.disconnected"] as const) {
      const e = parseWebhookEvent(
        envelope<ProfileEventData>(type, {
          id: "pf1",
          name: "X",
          platform: "twitter",
          profile_group_id: "g1",
          status: type === "profile.connected" ? "active" : "disconnected",
          uid: "u1",
          username: "handle",
        }),
      );
      expect(e.type).toBe(type);
    }
  });

  it("parses profile.stats", () => {
    const e = parseWebhookEvent(
      envelope<ProfileStatsData>("profile.stats", {
        profile_id: "pf1",
        platform: "linkedin",
        placement_id: "org_1",
        stats: { followerCount: 4567 },
        recorded_at: "2026-05-12T00:00:00Z",
      }),
    );
    if (e.type !== "profile.stats") throw new Error("wrong narrowing");
    expect(e.data.placement_id).toBe("org_1");
    expect(e.data.stats.followerCount).toBe(4567);
  });

  it("parses media.failed", () => {
    const e = parseWebhookEvent(
      envelope<MediaFailedData>("media.failed", {
        id: "m1",
        post_id: "p1",
        content_type: "image/jpeg",
        status: "failed",
        error_message: "broken",
      }),
    );
    if (e.type !== "media.failed") throw new Error("wrong narrowing");
    expect(e.data.error_message).toBe("broken");
  });

  it("parses comment.created", () => {
    const e = parseWebhookEvent(
      envelope<CommentCreatedData>("comment.created", {
        id: "c1",
        post_id: "p1",
        platform_post_id: "pp1",
        platform: "instagram",
        external_id: "ig_c",
        parent_external_id: null,
        body: "great",
        status: "published",
        author_external_id: "u",
        author_name: "Jane",
        author_username: "jane",
        author_avatar_url: null,
        like_count: 0,
        reply_count: 0,
        is_hidden: false,
        permalink: null,
        platform_data: null,
        posted_at: null,
        created_at: "2026-05-12T00:00:00Z",
      }),
    );
    if (e.type !== "comment.created") throw new Error("wrong narrowing");
    expect(e.data.author_name).toBe("Jane");
  });

  it("parses all message.* events", () => {
    const types = [
      "message.received",
      "message.sent",
      "message.delivered",
      "message.read",
      "message.edited",
      "message.deleted",
      "message.failed_waiting_for_retry",
      "message.failed",
    ] as const;
    for (const type of types) {
      const e = parseWebhookEvent(
        envelope<MessageEventData>(type, { message: mockMessage() }),
      );
      expect(e.type).toBe(type);
      if (
        e.type === "message.received" ||
        e.type === "message.sent" ||
        e.type === "message.delivered" ||
        e.type === "message.read" ||
        e.type === "message.edited" ||
        e.type === "message.deleted" ||
        e.type === "message.failed_waiting_for_retry" ||
        e.type === "message.failed"
      ) {
        expect(e.data.message.id).toBe("msg_1");
      }
    }
  });

  it("parses reaction.received", () => {
    const e = parseWebhookEvent(
      envelope<ReactionEventData>("reaction.received", {
        message: mockMessage({
          reactions: [
            {
              sender_external_id: "psid_123",
              emoji: "❤️",
              reaction: "love",
              at: "2026-06-01T15:02:00Z",
            },
          ],
        }),
        sender_external_id: "psid_123",
        action: "react",
        reaction: "love",
        emoji: "❤️",
        occurred_at: "2026-06-01T15:02:00Z",
      }),
    );
    if (e.type !== "reaction.received") throw new Error("wrong narrowing");
    expect(e.data.action).toBe("react");
    expect(e.data.message.reactions[0].reaction).toBe("love");
  });

  it("parses profile_comment.created", () => {
    const e = parseWebhookEvent(
      envelope<ProfileCommentCreatedData>("profile_comment.created", {
        id: "abc123",
        profile_id: "prof123",
        platform: "google_business",
        placement_id: "accounts/1/locations/2",
        external_id: "accounts/1/locations/2/reviews/A",
        parent_external_id: null,
        body: "Great coffee!",
        status: "synced",
        author_username: "Jane D.",
        author_avatar_url: null,
        platform_data: { star_rating: 5 },
        posted_at: "2026-05-10T11:55:00Z",
        created_at: "2026-05-13T18:00:00Z",
      }),
    );
    if (e.type !== "profile_comment.created") throw new Error("wrong narrowing");
    expect(e.data.platform_data?.star_rating).toBe(5);
  });

  it("throws on unknown event type", () => {
    expect(() =>
      parseWebhookEvent(envelope("foo.bar", {})),
    ).toThrow(WebhookParseError);
  });

  it("throws on invalid JSON", () => {
    expect(() => parseWebhookEvent("not json{")).toThrow(WebhookParseError);
  });
});
