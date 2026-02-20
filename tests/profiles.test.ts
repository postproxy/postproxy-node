import { describe, it, expect } from "vitest";
import { createMockClient } from "./setup.js";

const MOCK_PROFILE = {
  id: "prof-1",
  name: "Test Profile",
  status: "active",
  platform: "instagram",
  profile_group_id: "pg-1",
  expires_at: null,
  post_count: 5,
};

describe("Profiles Resource", () => {
  it("lists profiles", async () => {
    const { client } = createMockClient({
      responseBody: { data: [MOCK_PROFILE] },
    });
    const result = await client.profiles.list();
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe("prof-1");
    expect(result.data[0].platform).toBe("instagram");
  });

  it("gets a profile by id", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: MOCK_PROFILE,
    });
    const profile = await client.profiles.get("prof-1");
    expect(profile.name).toBe("Test Profile");
    expect(getRequests()[0].url).toContain("/profiles/prof-1");
  });

  it("gets placements for a profile", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: { data: [{ id: "pl-1", name: "Feed" }] },
    });
    const result = await client.profiles.placements("prof-1");
    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe("Feed");
    expect(getRequests()[0].url).toContain("/profiles/prof-1/placements");
  });

  it("deletes a profile", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: { success: true },
    });
    const result = await client.profiles.delete("prof-1");
    expect(result.success).toBe(true);
    expect(getRequests()[0].method).toBe("DELETE");
  });
});
