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

  it("assigns a placement to another group", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: {
        id: "pl-1",
        name: "Feed",
        metadata: {},
        profile_group_id: "pg-2",
      },
    });
    const result = await client.profiles.assignPlacementToGroup("prof-1", {
      placementId: "pl-1",
      targetProfileGroupId: "pg-2",
    });
    expect(result.profile_group_id).toBe("pg-2");
    const request = getRequests()[0];
    expect(request.method).toBe("PATCH");
    expect(request.url).toContain(
      "/profiles/prof-1/assign_placement_to_group",
    );
    expect(request.body).toEqual({
      placement_id: "pl-1",
      target_profile_group_id: "pg-2",
    });
  });

  it("lists ice breakers", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: {
        ice_breakers: [{ question: "What do you do?", payload: "services" }],
      },
    });
    const result = await client.profiles.iceBreakers("prof-1");
    expect(result.ice_breakers).toHaveLength(1);
    expect(result.ice_breakers[0].question).toBe("What do you do?");
    const request = getRequests()[0];
    expect(request.method).toBe("GET");
    expect(request.url).toContain("/profiles/prof-1/ice_breakers");
  });

  it("sets ice breakers", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: { success: true },
    });
    const result = await client.profiles.setIceBreakers("prof-1", [
      { question: "What do you do?", payload: "services" },
    ]);
    expect(result.success).toBe(true);
    const request = getRequests()[0];
    expect(request.method).toBe("POST");
    expect(request.url).toContain("/profiles/prof-1/ice_breakers");
    expect(request.body).toEqual({
      ice_breakers: [{ question: "What do you do?", payload: "services" }],
    });
  });

  it("deletes ice breakers", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: { success: true },
    });
    const result = await client.profiles.deleteIceBreakers("prof-1");
    expect(result.success).toBe(true);
    const request = getRequests()[0];
    expect(request.method).toBe("DELETE");
    expect(request.url).toContain("/profiles/prof-1/ice_breakers");
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
