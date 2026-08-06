import { PostProxy, ConflictError } from "postproxy-sdk";

const API_KEY = process.env.POSTPROXY_API_KEY!;
const PROFILE_GROUP_ID = process.env.POSTPROXY_PROFILE_GROUP_ID;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const client = new PostProxy(API_KEY, {
    profileGroupId: PROFILE_GROUP_ID,
  });

  const profileId = "your-profile-id";

  // Start a backfill. It walks the profile's feed backwards from the newest
  // post in batches of 25 and stops at `from` — or earlier, if the platform
  // stops returning history. Runs in the background.
  let sync;
  try {
    sync = await client.profiles.backfillPosts(profileId, {
      from: "2025-01-01",
    });
  } catch (error) {
    if (error instanceof ConflictError) {
      // Only one backfill runs per profile at a time; the running one already
      // covers any window a second request could ask for.
      const runningId = error.response?.profile_sync_id as string;
      console.log(`Backfill already running: ${runningId}`);
      sync = await client.profiles.postSync(profileId, runningId);
    } else {
      throw error;
    }
  }

  console.log(`Backfill ${sync.id} — status: ${sync.status}`);

  // Poll until it finishes.
  while (sync.status === "pending" || sync.status === "running") {
    await sleep(5000);
    sync = await client.profiles.postSync(profileId, sync.id);
    console.log(
      `  ${sync.status}: ${sync.posts_imported} imported of ${sync.posts_seen} seen, ` +
        `reached back to ${sync.oldest_posted_at ?? "—"}`,
    );
  }

  if (sync.status === "failed") {
    console.error(`Backfill failed: ${sync.error}`);
  } else {
    console.log(
      `Done. Imported ${sync.posts_imported} posts, oldest ${sync.oldest_posted_at}`,
    );
  }

  // Every pull is recorded — the sync fired on connect, the recurring poll,
  // and each backfill. Runs are kept for 30 days.
  const runs = await client.profiles.postSyncs(profileId, { perPage: 10 });
  console.log(`\nRecent post syncs (${runs.total}):`);
  for (const run of runs.data) {
    console.log(
      `  ${run.created_at} ${run.trigger} → ${run.status} ` +
        `(${run.posts_imported}/${run.posts_seen} new)`,
    );
  }
}

main().catch(console.error);
