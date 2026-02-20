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

// Delete a post
const result = await client.posts.delete("post-id");
console.log(result.deleted); // true
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
| `Post` | id, body, status, scheduled_at, created_at, platforms |
| `Profile` | id, name, status, platform, profile_group_id, expires_at, post_count |
| `ProfileGroup` | id, name, profiles_count |
| `PlatformResult` | platform, status, params, error, attempted_at, insights |
| `ListResponse<T>` | data |
| `PaginatedResponse<T>` | total, page, per_page, data |

### Platform parameter types

| Type | Platform |
|---|---|
| `FacebookParams` | format (`post`, `story`), first_comment, page_id |
| `InstagramParams` | format (`post`, `reel`, `story`), first_comment, collaborators, cover_url, audio_name, trial_strategy, thumb_offset |
| `TikTokParams` | format (`video`, `image`), privacy_status, photo_cover_index, auto_add_music, made_with_ai, disable_comment, disable_duet, disable_stitch, brand_content_toggle, brand_organic_toggle |
| `LinkedInParams` | format (`post`), organization_id |
| `YouTubeParams` | format (`post`), title, privacy_status, cover_url |
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
