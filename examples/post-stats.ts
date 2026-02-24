import { PostProxy } from "postproxy-sdk";

const API_KEY = "POSTPROXY_API_KEY";
const PROFILE_GROUP_ID = "your-profile-group-id";

async function main() {
  const client = new PostProxy(API_KEY, {
    profileGroupId: PROFILE_GROUP_ID,
  });

  // Get stats for a single post
  const stats = await client.posts.stats(["post-id-1"]);
  for (const [postId, postStats] of Object.entries(stats.data)) {
    console.log(`\nPost: ${postId}`);
    for (const platform of postStats.platforms) {
      console.log(`  ${platform.platform} (${platform.profile_id}):`);
      for (const record of platform.records) {
        console.log(`    ${record.recorded_at}:`, record.stats);
      }
    }
  }

  // Get stats for multiple posts with filters
  const filtered = await client.posts.stats(
    ["post-id-1", "post-id-2", "post-id-3"],
    {
      profiles: ["instagram", "twitter"],
      from: "2026-02-01T00:00:00Z",
      to: "2026-02-24T00:00:00Z",
    },
  );
  console.log("\nFiltered stats:", JSON.stringify(filtered.data, null, 2));

  // Filter by specific profile IDs
  const byProfile = await client.posts.stats(["post-id-1"], {
    profiles: ["prof-abc123"],
  });
  console.log("\nStats for specific profile:", byProfile.data);

  // Use Date objects for time range
  const recent = await client.posts.stats(["post-id-1"], {
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // last 7 days
  });
  console.log("\nRecent stats:", recent.data);
}

main().catch(console.error);
