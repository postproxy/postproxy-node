import { afterEach, describe, expect, it, vi } from "vitest";
import { PostProxy, VERSION } from "../src/index.js";

describe("User-Agent header", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends User-Agent containing the SDK name and version", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ data: [] }), { status: 200 }),
      );

    const client = new PostProxy("test-api-key", {
      baseUrl: "https://mock.postproxy.dev",
    });
    await client.profiles.list();

    expect(fetchSpy).toHaveBeenCalledOnce();
    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers["User-Agent"]).toContain(`postproxy-node/${VERSION}`);
    expect(headers["User-Agent"]).toContain("node/");
  });

  it("VERSION constant is the bumped value", () => {
    expect(VERSION).toBe("1.11.0");
  });
});
