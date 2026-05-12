import { describe, expect, it } from "vitest";
import { createMockClient } from "./setup.js";

describe("Profile stats endpoint", () => {
  it("calls GET /profiles/:id/stats with placement_id", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: {
        data: {
          profile_id: "pf1",
          platform: "linkedin",
          placement_id: "org_1",
          records: [{ stats: { followerCount: 100 }, recorded_at: "2026-05-12T00:00:00Z" }],
        },
      },
    });

    const result = await client.profiles.getProfileStats("pf1", {
      placementId: "org_1",
      from: "2026-04-01T00:00:00Z",
    });

    expect(result.data.profile_id).toBe("pf1");
    expect(result.data.records[0].stats.followerCount).toBe(100);

    const req = getRequests()[0];
    expect(req.method).toBe("GET");
    expect(req.url).toContain("/profiles/pf1/stats");
    expect(req.url).toContain("placement_id=org_1");
    expect(req.url).toContain("from=2026-04-01T00%3A00%3A00Z");
  });

  it("omits placement_id for non-placement networks", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: {
        data: {
          profile_id: "bsky1",
          platform: "bluesky",
          placement_id: null,
          records: [],
        },
      },
    });

    await client.profiles.getProfileStats("bsky1");

    const req = getRequests()[0];
    expect(req.url).not.toContain("placement_id");
  });
});
