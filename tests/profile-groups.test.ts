import { describe, it, expect } from "vitest";
import { createMockClient } from "./setup.js";

const MOCK_GROUP = {
  id: "pg-1",
  name: "Test Group",
  profiles_count: 3,
};

describe("Profile Groups Resource", () => {
  it("lists profile groups", async () => {
    const { client } = createMockClient({
      responseBody: { data: [MOCK_GROUP] },
    });
    const groups = await client.profileGroups.list();
    expect(groups).toHaveLength(1);
    expect(groups[0].name).toBe("Test Group");
  });

  it("gets a profile group by id", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: MOCK_GROUP,
    });
    const group = await client.profileGroups.get("pg-1");
    expect(group.profiles_count).toBe(3);
    expect(getRequests()[0].url).toContain("/profile_groups/pg-1");
  });

  it("creates a profile group", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: MOCK_GROUP,
    });
    const group = await client.profileGroups.create("Test Group");
    expect(group.name).toBe("Test Group");
    expect(getRequests()[0].body).toEqual({
      profile_group: { name: "Test Group" },
    });
  });

  it("deletes a profile group", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: { deleted: true },
    });
    const result = await client.profileGroups.delete("pg-1");
    expect(result.deleted).toBe(true);
    expect(getRequests()[0].method).toBe("DELETE");
  });

  it("initializes a connection", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: { url: "https://auth.example.com", success: true },
    });
    const conn = await client.profileGroups.initializeConnection(
      "pg-1",
      "instagram",
      "https://callback.example.com",
    );
    expect(conn.url).toBe("https://auth.example.com");
    expect(conn.success).toBe(true);

    const req = getRequests()[0];
    expect(req.url).toContain("/profile_groups/pg-1/initialize_connection");
    expect(req.body).toEqual({
      platform: "instagram",
      redirect_url: "https://callback.example.com",
    });
  });
});
