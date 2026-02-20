import { describe, it, expect } from "vitest";
import type {
  Post,
  Profile,
  PlatformResult,
  PaginatedResponse,
  PlatformParams,
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
});
