export const BASE_URL = "https://api.postproxy.dev";

export const VERSION = "1.8.0";

export type Platform =
  | "facebook"
  | "instagram"
  | "tiktok"
  | "linkedin"
  | "youtube"
  | "twitter"
  | "threads"
  | "pinterest"
  | "bluesky"
  | "telegram";

export type ProfileStatus = "active" | "expired" | "inactive";

export type PostStatus =
  | "pending"
  | "draft"
  | "processing"
  | "processed"
  | "scheduled"
  | "media_processing_failed";

export type MediaStatus = "pending" | "processed" | "failed";

export type PlatformPostStatus =
  | "pending"
  | "processing"
  | "published"
  | "failed"
  | "deleted";

export type InstagramFormat = "post" | "reel" | "story";
export type FacebookFormat = "post" | "story" | "reel";
export type TikTokFormat = "video" | "image";
export type LinkedInFormat = "post";
export type YouTubeFormat = "post";
export type PinterestFormat = "pin";
export type ThreadsFormat = "post";
export type TwitterFormat = "post";
export type BlueskyFormat = "post";
export type TelegramFormat = "post";

export type TikTokPrivacy =
  | "PUBLIC_TO_EVERYONE"
  | "MUTUAL_FOLLOW_FRIENDS"
  | "FOLLOWER_OF_CREATOR"
  | "SELF_ONLY";

export type YouTubePrivacy = "public" | "unlisted" | "private";

export type TelegramParseMode = "HTML" | "MarkdownV2";

export const WEBHOOK_EVENT_TYPES = [
  "post.processed",
  "post.imported",
  "platform_post.published",
  "platform_post.failed",
  "platform_post.failed_waiting_for_retry",
  "platform_post.insights",
  "profile.connected",
  "profile.disconnected",
  "profile.stats",
  "media.failed",
  "comment.created",
] as const;

export type WebhookEventType = (typeof WEBHOOK_EVENT_TYPES)[number];
