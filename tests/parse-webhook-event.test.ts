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
} from "../src/index.js";

const envelope = <T>(type: string, data: T) => ({
  id: "evt_1",
  type,
  created_at: "2026-05-12T00:00:00Z",
  data,
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

  it("throws on unknown event type", () => {
    expect(() =>
      parseWebhookEvent(envelope("foo.bar", {})),
    ).toThrow(WebhookParseError);
  });

  it("throws on invalid JSON", () => {
    expect(() => parseWebhookEvent("not json{")).toThrow(WebhookParseError);
  });
});
