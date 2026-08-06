import { describe, it, expect } from "vitest";
import type {
  Post,
  Profile,
  PlatformResult,
  PaginatedResponse,
  PlatformParams,
  PostSync,
  StatsRecord,
} from "../src/index.js";

describe("Types", () => {
  it("Post type matches expected shape", () => {
    const post: Post = {
      id: "1",
      body: "Hello",
      status: "pending",
      scheduled_at: null,
      created_at: "2025-01-01T00:00:00Z",
      platforms: [
        {
          platform: "instagram",
          status: "published",
          params: null,
          error: null,
          attempted_at: "2025-01-01T00:01:00Z",
          insights: { impressions: 100, on: "2025-01-02T00:00:00Z" },
        },
      ],
    };
    expect(post.platforms).toHaveLength(1);
    expect(post.platforms[0].insights?.impressions).toBe(100);
  });

  it("PaginatedResponse type works with generics", () => {
    const page: PaginatedResponse<Post> = {
      total: 50,
      page: 0,
      per_page: 10,
      data: [],
    };
    expect(page.total).toBe(50);
  });

  it("PlatformParams allows partial platform configs", () => {
    const params: PlatformParams = {
      instagram: { format: "reel", collaborators: ["user1"] },
      tiktok: { privacy_status: "PUBLIC_TO_EVERYONE", made_with_ai: true },
    };
    expect(params.instagram?.format).toBe("reel");
    expect(params.tiktok?.made_with_ai).toBe(true);
  });

  it("InstagramParams accepts user tags", () => {
    const params: PlatformParams = {
      instagram: {
        format: "post",
        user_tags: [
          { username: "natgeo", x: 0.5, y: 0.4 },
          { username: "nasa", x: 0.2, y: 0.8, media_index: 1 },
          // Video slides are tagged by username only.
          { username: "spacex", media_index: 2 },
        ],
      },
    };
    expect(params.instagram?.user_tags).toHaveLength(3);
    expect(params.instagram?.user_tags?.[0].x).toBe(0.5);
    expect(params.instagram?.user_tags?.[2].media_index).toBe(2);
  });

  it("StatsRecord carries raw_stats alongside stats", () => {
    const record: StatsRecord = {
      stats: { impressions: 1200 },
      raw_stats: { views: 1200, impression_count: 1200 },
      recorded_at: "2026-02-20T12:00:00Z",
    };
    expect(record.raw_stats.views).toBe(1200);
  });

  it("PostSync type matches expected shape", () => {
    const sync: PostSync = {
      id: "sync456def",
      profile_id: "prof123abc",
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
    expect(sync.trigger).toBe("backfill");
    expect(sync.posts_imported).toBeLessThan(sync.posts_seen);
  });
});
