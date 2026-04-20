# PostProxy Node SDK

TypeScript/JavaScript client for the [PostProxy API](https://postproxy.dev). Fully typed with zero runtime dependencies — uses native `fetch`, `FormData`, and `Blob` (Node.js 18+).

## Installation

```bash
npm install postproxy-sdk
```

Requires Node.js 18+.

## Quick start

```typescript
import { PostProxy } from "postproxy-sdk";

const client = new PostProxy("your-api-key", {
  profileGroupId: "pg-abc",
});

// List profiles
const { data: profiles } = await client.profiles.list();

// Create a post
const post = await client.posts.create(
  "Hello from PostProxy!",
  [profiles[0].id],
);
console.log(post.id, post.status);
```

## Usage

### Client

```typescript
import { PostProxy } from "postproxy-sdk";

// Basic
const client = new PostProxy("your-api-key");

// With a default profile group (applied to all requests)
const client = new PostProxy("your-api-key", {
  profileGroupId: "pg-abc",
});

// With a custom base URL
const client = new PostProxy("your-api-key", {
  baseUrl: "https://custom.postproxy.dev",
});
```

### Posts

```typescript
// List posts (paginated)
const page = await client.posts.list({ page: 0, perPage: 10, status: "draft" });
console.log(page.total, page.data);

// Filter by platform and schedule
const page = await client.posts.list({
  platforms: ["instagram", "tiktok"],
  scheduledAfter: "2025-06-01T00:00:00Z",
});

// Get a single post
const post = await client.posts.get("post-id");

// Create a post
const post = await client.posts.create(
  "Check out our new product!",
  ["profile-id-1", "profile-id-2"],
);

// Create a draft
const post = await client.posts.create(
  "Draft content",
  ["profile-id"],
  { draft: true },
);

// Create with media URLs
const post = await client.posts.create(
  "Photo post",
  ["profile-id"],
  { media: ["https://example.com/image.jpg"] },
);

// Create with local file uploads
const post = await client.posts.create(
  "Posted with a local file!",
  ["profile-id"],
  { mediaFiles: ["./photo.jpg", "./video.mp4"] },
);

// Create with platform-specific params
import type { PlatformParams } from "postproxy-sdk";

const post = await client.posts.create(
  "Cross-platform post",
  ["ig-profile", "tt-profile"],
  {
    platforms: {
      instagram: { format: "reel", collaborators: ["@friend"] },
      tiktok: { format: "video", privacy_status: "PUBLIC_TO_EVERYONE" },
    },
  },
);

// Schedule a post
const post = await client.posts.create(
  "Scheduled post",
  ["profile-id"],
  { scheduledAt: "2025-12-25T09:00:00Z" },
);

// Publish a draft
const post = await client.posts.publishDraft("post-id");

// Update a post (only drafts and scheduled posts >5min before publish)
// All fields are optional — send only what you want to change
const updated = await client.posts.update("post-id", {
  body: "Updated content",
});

// Update platform params only (merged with existing)
await client.posts.update("post-id", {
  platforms: { youtube: { privacy_status: "unlisted" } },
});

// Replace profiles and media (full replace)
await client.posts.update("post-id", {
  profiles: ["twitter", "threads"],
  media: ["https://example.com/new.jpg"],
});

// Remove all media
await client.posts.update("post-id", { media: [] });

// Replace the thread
await client.posts.update("post-id", {
  thread: [
    { body: "Updated first reply" },
    { body: "Updated second reply", media: ["https://example.com/img.jpg"] },
  ],
});

// Create a thread post
const post = await client.posts.create(
  "Thread starts here",
  ["profile-id"],
  {
    thread: [
      { body: "Second post in the thread" },
      { body: "Third with media", media: ["https://example.com/img.jpg"] },
    ],
  },
);
console.log(post.thread); // ThreadChild[]

// Delete a post
const result = await client.posts.delete("post-id");
console.log(result.deleted); // true

// Delete a post and also remove it from social platforms
const result = await client.posts.delete("post-id", { deleteOnPlatform: true });

// Delete from platforms only (keeps DB record). Defaults to all platforms.
const r1 = await client.posts.deleteOnPlatform("post-id");
// Target a single network
const r2 = await client.posts.deleteOnPlatform("post-id", { network: "twitter" });
// Target a specific profile
const r3 = await client.posts.deleteOnPlatform("post-id", { profileId: "prof-abc" });
// Target a specific post profile (covers entire thread for that profile)
const r4 = await client.posts.deleteOnPlatform("post-id", { postProfileId: "pp-abc" });
console.log(r1.deleting); // [{ post_profile_id, platform }]

// Get stats for posts
const stats = await client.posts.stats(["post-id-1", "post-id-2"]);
for (const [postId, postStats] of Object.entries(stats.data)) {
  for (const platform of postStats.platforms) {
    console.log(platform.platform, platform.records);
  }
}

// Get stats with filters (by platform/profile and time range)
const stats = await client.posts.stats(["post-id"], {
  profiles: ["instagram", "twitter"],
  from: "2026-02-01T00:00:00Z",
  to: "2026-02-24T00:00:00Z",
});
```

### Webhooks

```typescript
// List webhooks
const { data: webhooks } = await client.webhooks.list();

// Get a webhook
const webhook = await client.webhooks.get("wh-id");

// Create a webhook
const webhook = await client.webhooks.create(
  "https://example.com/webhook",
  ["post.published", "post.failed"],
  { description: "My webhook" },
);
console.log(webhook.id, webhook.secret);

// Update a webhook
const webhook = await client.webhooks.update("wh-id", {
  events: ["post.published"],
  enabled: false,
});

// Delete a webhook
const result = await client.webhooks.delete("wh-id");

// List deliveries
const deliveries = await client.webhooks.deliveries("wh-id", {
  page: 0,
  perPage: 10,
});
```

#### Signature verification

Verify incoming webhook signatures using HMAC-SHA256:

```typescript
import { verifySignature } from "postproxy-sdk";

const isValid = verifySignature(
  requestBody,                          // raw request body string
  request.headers["x-postproxy-signature"],  // "t=...,v1=..."
  "whsec_...",                          // webhook secret
);
```

### Queues

```typescript
// List all queues
const { data: queues } = await client.queues.list();

// Get a queue
const queue = await client.queues.get("queue-id");
console.log(queue.name, queue.timeslots, queue.enabled);

// Get next available slot
const nextSlot = await client.queues.nextSlot("queue-id");
console.log(nextSlot.next_slot);

// Create a queue with timeslots
const queue = await client.queues.create("Morning Posts", "profile-group-id", {
  description: "Weekday morning content",
  timezone: "America/New_York",
  jitter: 10,
  timeslots: [
    { day: 1, time: "09:00" },
    { day: 2, time: "09:00" },
    { day: 3, time: "09:00" },
  ],
});

// Update a queue
const queue = await client.queues.update("queue-id", {
  jitter: 15,
  timeslots: [
    { day: 6, time: "10:00" },        // add new timeslot
    { id: 1, _destroy: true },         // remove existing timeslot
  ],
});

// Pause/unpause a queue
await client.queues.update("queue-id", { enabled: false });

// Delete a queue
const result = await client.queues.delete("queue-id");
console.log(result.deleted); // true

// Add a post to a queue
const post = await client.posts.create(
  "This post will be scheduled by the queue",
  ["profile-id"],
  { queueId: "queue-id", queuePriority: "high" },
);
```

### Comments

```typescript
// List comments on a post (paginated)
const comments = await client.comments.list("post-id", "profile-id");
for (const comment of comments.data) {
  console.log(comment.author_username, comment.body);
  for (const reply of comment.replies ?? []) {
    console.log(`  ${reply.author_username}: ${reply.body}`);
  }
}

// List with pagination
const comments = await client.comments.list("post-id", "profile-id", {
  page: 2,
  perPage: 10,
});

// Get a single comment
const comment = await client.comments.get("post-id", "comment-id", "profile-id");

// Create a comment
const comment = await client.comments.create("post-id", "profile-id", "Great post!");

// Reply to a comment
const reply = await client.comments.create("post-id", "profile-id", "Thanks!", {
  parentId: "comment-id",
});

// Delete a comment
const result = await client.comments.delete("post-id", "comment-id", "profile-id");
console.log(result.accepted); // true

// Hide / unhide a comment
await client.comments.hide("post-id", "comment-id", "profile-id");
await client.comments.unhide("post-id", "comment-id", "profile-id");

// Like / unlike a comment
await client.comments.like("post-id", "comment-id", "profile-id");
await client.comments.unlike("post-id", "comment-id", "profile-id");
```

### Profiles

```typescript
// List all profiles
const { data: profiles } = await client.profiles.list();

// List profiles in a specific group (overrides client default)
const { data: profiles } = await client.profiles.list({ profileGroupId: "pg-other" });

// Get a single profile
const profile = await client.profiles.get("profile-id");
console.log(profile.name, profile.platform, profile.status);

// Get available placements for a profile
const { data: placements } = await client.profiles.placements("profile-id");
for (const p of placements) {
  console.log(p.id, p.name);
}

// Delete a profile
const result = await client.profiles.delete("profile-id");
console.log(result.success); // true
```

### Profile Groups

```typescript
// List all groups
const { data: groups } = await client.profileGroups.list();

// Get a single group
const group = await client.profileGroups.get("pg-id");
console.log(group.name, group.profiles_count);

// Create a group
const group = await client.profileGroups.create("My New Group");

// Delete a group (must have no profiles)
const result = await client.profileGroups.delete("pg-id");
console.log(result.deleted); // true

// Initialize a social platform connection
const conn = await client.profileGroups.initializeConnection(
  "pg-id",
  "instagram",
  "https://yourapp.com/callback",
);
console.log(conn.url); // Redirect the user to this URL
```

## Error handling

All errors extend `PostProxyError`, which includes the HTTP status code and raw response body:

```typescript
import {
  PostProxyError,
  AuthenticationError,   // 401
  BadRequestError,       // 400
  NotFoundError,         // 404
  ValidationError,       // 422
} from "postproxy-sdk";

try {
  await client.posts.get("nonexistent");
} catch (e) {
  if (e instanceof NotFoundError) {
    console.log(e.statusCode);  // 404
    console.log(e.response);    // { error: "Not found" }
  } else if (e instanceof PostProxyError) {
    console.log(`API error ${e.statusCode}: ${e.message}`);
  }
}
```

## Types

All list methods return a response object with a `data` array — use destructuring to access items directly:

```typescript
const { data: profiles } = await client.profiles.list();
const { data: posts } = await client.posts.list();  // also has total, page, per_page
```

Key types:

| Type | Fields |
|---|---|
| `Post` | id, body, status, scheduled_at, created_at, media, thread, platforms, queue_id, queue_priority |
| `Profile` | id, name, status, platform, profile_group_id, expires_at, post_count |
| `ProfileGroup` | id, name, profiles_count |
| `Media` | id, type, url, status |
| `ThreadChild` | id, body, media |
| `ThreadChildInput` | body, media |
| `Webhook` | id, url, events, secret, enabled, description, created_at |
| `WebhookDelivery` | id, event_id, event_type, response_status, attempt_number, success, attempted_at, created_at |
| `PlatformResult` | platform, status, params, error, attempted_at, insights |
| `ListResponse<T>` | data |
| `Comment` | id, external_id, body, status, author_username, author_avatar_url, author_external_id, parent_external_id, like_count, is_hidden, permalink, platform_data, posted_at, created_at, replies |
| `AcceptedResponse` | accepted |
| `PaginatedResponse<T>` | total, page, per_page, data |
| `StatsResponse` | data (keyed by post id) |
| `PostStats` | platforms |
| `PlatformStats` | profile_id, platform, records |
| `StatsRecord` | stats, recorded_at |
| `Queue` | id, name, description, timezone, enabled, jitter, profile_group_id, timeslots, posts_count |
| `Timeslot` | id, day, time |
| `NextSlotResponse` | next_slot |

### Platform parameter types

| Type | Platform |
|---|---|
| `FacebookParams` | format (`post`, `story`), first_comment, page_id |
| `InstagramParams` | format (`post`, `reel`, `story`), first_comment, collaborators, cover_url, audio_name, trial_strategy, thumb_offset |
| `TikTokParams` | format (`video`, `image`), privacy_status, photo_cover_index, auto_add_music, made_with_ai, disable_comment, disable_duet, disable_stitch, brand_content_toggle, brand_organic_toggle |
| `LinkedInParams` | format (`post`), organization_id |
| `YouTubeParams` | format (`post`), title, privacy_status, cover_url, made_for_kids, tags, category_id, contains_synthetic_media |
| `PinterestParams` | format (`pin`), title, board_id, destination_link, cover_url, thumb_offset |
| `ThreadsParams` | format (`post`) |
| `TwitterParams` | format (`post`) |

Wrap them in `PlatformParams` when passing to `posts.create()`.

## Development

```bash
npm install
npm test
npm run build
```

## License

MIT
