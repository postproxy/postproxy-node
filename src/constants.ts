export const BASE_URL = "https://api.postproxy.dev";

export type Platform =
  | "facebook"
  | "instagram"
  | "tiktok"
  | "linkedin"
  | "youtube"
  | "twitter"
  | "threads"
  | "pinterest";

export type ProfileStatus = "active" | "expired" | "inactive";

export type PostStatus =
  | "pending"
  | "draft"
  | "processing"
  | "processed"
  | "scheduled";

export type PlatformPostStatus =
  | "pending"
  | "processing"
  | "published"
  | "failed"
  | "deleted";

export type InstagramFormat = "post" | "reel" | "story";
export type FacebookFormat = "post" | "story";
export type TikTokFormat = "video" | "image";
export type LinkedInFormat = "post";
export type YouTubeFormat = "post";
export type PinterestFormat = "pin";
export type ThreadsFormat = "post";
export type TwitterFormat = "post";

export type TikTokPrivacy =
  | "PUBLIC_TO_EVERYONE"
  | "MUTUAL_FOLLOW_FRIENDS"
  | "FOLLOWER_OF_CREATOR"
  | "SELF_ONLY";

export type YouTubePrivacy = "public" | "unlisted" | "private";
