import { describe, expect, it } from "vitest";
import { createMockClient } from "./setup.js";

describe("Telegram + BlueSky connect", () => {
  it("connectBluesky posts identifier + app_password", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: {
        success: true,
        profile: {
          id: "pf_bsky_1",
          network: "bluesky",
          name: "Jane",
          external_username: "jane.bsky.social",
        },
      },
    });

    const result = await client.profileGroups.connectBluesky("pg-1", {
      identifier: "jane.bsky.social",
      appPassword: "xxxx-xxxx-xxxx-xxxx",
    });

    expect(result.success).toBe(true);
    expect(result.profile.id).toBe("pf_bsky_1");

    const req = getRequests()[0];
    expect(req.url).toContain("/profile_groups/pg-1/initialize_connection");
    expect(req.body).toEqual({
      platform: "bluesky",
      identifier: "jane.bsky.social",
      app_password: "xxxx-xxxx-xxxx-xxxx",
    });
  });

  it("connectTelegram posts bot_token", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: {
        success: true,
        profile: {
          id: "pf_tg_1",
          network: "telegram",
          name: "My Bot",
          external_username: "my_bot",
        },
        next_step: "Add bot as admin to channels",
      },
    });

    const result = await client.profileGroups.connectTelegram("pg-1", {
      botToken: "123:ABC",
    });

    expect(result.success).toBe(true);
    expect(result.next_step).toContain("admin");

    const req = getRequests()[0];
    expect(req.body).toEqual({
      platform: "telegram",
      bot_token: "123:ABC",
    });
  });

  it("initializeConnection still works without redirectUrl", async () => {
    const { client, getRequests } = createMockClient({
      responseBody: { success: true, profile: { id: "x" } },
    });

    await client.profileGroups.initializeConnection(
      "pg-1",
      "telegram",
      undefined,
      { bot_token: "123:ABC" },
    );

    const req = getRequests()[0];
    expect(req.body).toEqual({
      platform: "telegram",
      bot_token: "123:ABC",
    });
  });
});
