# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.12.0] - 2026-08-06

### Added

- **Post syncs & backfill.** `profiles.backfillPosts(id, { from })` walks a profile's feed backwards from the newest post and imports the history behind it; `profiles.postSyncs(id, { trigger, status, page, perPage })` and `profiles.postSync(id, postSyncId)` expose every post pull — the one fired on connect, the recurring poll, and backfills — as a new `PostSync` type, with `PostSyncTrigger` and `PostSyncStatus`.
- **`comments.listAll({ postIds, profiles, from, to, page, perPage })`** — comments across every post in the profile group in one request. Flat: replies are their own entries linked by `parent_external_id`, typed as the new `BulkComment` (adds `post_id`, `profile_id`, `platform`).
- `from` and `to` options on `comments.list()`, filtering on when PostProxy received the comment.
- **Idempotency.** Every write method accepts an `idempotencyKey` option, sent as the `Idempotency-Key` header, so a dropped connection no longer forces a choice between a duplicate write and a lost one.
- `ConflictError` (409), raised for a duplicate submission (`response.duplicate_post_id`), a backfill already running (`response.profile_sync_id`), or an in-flight idempotency key. Previously these surfaced as a bare `PostProxyError`.
- **Instagram user tags.** `InstagramParams.user_tags` with the new `InstagramUserTag` type (`username`, `x`, `y`, `media_index`) — tag accounts on feed posts, reels, and stories.
- `StatsRecord.raw_stats` — every metric under its original platform name, alongside the normalized `stats`.
- `examples/backfill-posts.ts`, and cross-post comment listing in `examples/manage-comments.ts`.

### Changed

- LinkedIn post stats now normalize `likes`, `comments`, `shares`, and `clicks` alongside `impressions` (server-side; `stats` was already an open map).
- `HUMAN_AGENT` is now approved on **both** Facebook and Instagram and extends the reply window to 7 days. `messages.send(chatId, { tag: "HUMAN_AGENT" })` is unchanged — see the README for Meta's policy limits.

## [1.11.0] - 2026-07-14

### Added

- `profiles.iceBreakers(id)`, `profiles.setIceBreakers(id, iceBreakers)`, and `profiles.deleteIceBreakers(id)` for managing Instagram DM ice breakers, with `IceBreaker` and `IceBreakersResponse` types.
- `profiles.assignPlacementToGroup(id, { placementId, targetProfileGroupId })` to move a placement (Facebook Page, Telegram channel, GBP location) to another profile group; returns the new `AssignedPlacement` type.
- `Placement.metadata` field.
- Twitter polls: `TwitterFormat` now includes `"poll"`, and `TwitterParams` gains `poll_options` (2-4 choices, max 25 chars each) and `poll_duration_minutes` (5-10080).

## [1.10.0] - 2026-06-03

### Added

- **Direct Messages API.** New `chats` resource (`list`, `create`, `get`, `archive`, `unarchive`) and `messages` resource (`list`, `send`, `get`, `edit`, `react`, `unreact`), with `Chat`, `Message`, `Reaction`, and shared `Attachment` types. Supports Facebook Messenger, Instagram, Telegram, and Bluesky.
- `comments.privateReply(postId, commentId, profileId, text)` — sends a DM in reply to a comment's author (Instagram/Facebook); returns a `Message`.
- `Comment.attachments` (array of `Attachment`) and `Comment.metadata` fields.
- New webhook event types: `profile_comment.created`, `message.received`, `message.sent`, `message.delivered`, `message.read`, `message.edited`, `message.deleted`, `message.failed_waiting_for_retry`, `message.failed`, `reaction.received`, with typed payloads `MessageEventData`, `ReactionEventData`, and `ProfileCommentCreatedData` added to the `WebhookEvent` discriminated union.

## [1.9.0] - 2026-05-15

### Added

- `google_business` platform value for posts and profiles.
- `profileComments` resource: `list`, `get`, `create`, `delete` for review replies via `/api/profiles/:profile_id/comments`.
- Per-media platform error reporting: `Media.platforms[]` containing `MediaPlatformError` entries with `error_details`.
