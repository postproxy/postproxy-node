import type {
  Platform,
  ProfileStatus,
  PostStatus,
  PlatformPostStatus,
  InstagramFormat,
  FacebookFormat,
  TikTokFormat,
  LinkedInFormat,
  YouTubeFormat,
  PinterestFormat,
  ThreadsFormat,
  TwitterFormat,
  TikTokPrivacy,
  YouTubePrivacy,
} from "./constants";

// --- Response Models ---

export interface Profile {
  id: string;
  name: string;
  status: ProfileStatus;
  platform: Platform;
  profile_group_id: string;
  expires_at: string | null;
  post_count: number;
}

export interface ProfileGroup {
  id: string;
  name: string;
  profiles_count: number;
}

export interface Placement {
  id: string;
  name: string;
}

export interface Insights {
  impressions: number | null;
  on: string | null;
}

export interface PlatformResult {
  platform: Platform;
  status: PlatformPostStatus;
  params: Record<string, unknown> | null;
  error: string | null;
  attempted_at: string | null;
  insights: Insights | null;
}

export interface Post {
  id: string;
  body: string;
  status: PostStatus;
  scheduled_at: string | null;
  created_at: string;
  platforms: PlatformResult[];
}

export interface ListResponse<T> {
  data: T[];
}

export interface PaginatedResponse<T> extends ListResponse<T> {
  total: number;
  page: number;
  per_page: number;
}

export interface DeleteResponse {
  deleted: boolean;
}

export interface SuccessResponse {
  success: boolean;
}

export interface ConnectionResponse {
  url: string;
  success: boolean;
}

// --- Platform Parameter Models ---

export interface FacebookParams {
  format?: FacebookFormat;
  first_comment?: string;
  page_id?: string;
}

export interface InstagramParams {
  format?: InstagramFormat;
  first_comment?: string;
  collaborators?: string[];
  cover_url?: string;
  audio_name?: string;
  trial_strategy?: boolean;
  thumb_offset?: number;
}

export interface TikTokParams {
  format?: TikTokFormat;
  privacy_status?: TikTokPrivacy;
  photo_cover_index?: number;
  auto_add_music?: boolean;
  made_with_ai?: boolean;
  disable_comment?: boolean;
  disable_duet?: boolean;
  disable_stitch?: boolean;
  brand_content_toggle?: boolean;
  brand_organic_toggle?: boolean;
}

export interface LinkedInParams {
  format?: LinkedInFormat;
  organization_id?: string;
}

export interface YouTubeParams {
  format?: YouTubeFormat;
  title?: string;
  privacy_status?: YouTubePrivacy;
  cover_url?: string;
}

export interface PinterestParams {
  format?: PinterestFormat;
  title?: string;
  board_id?: string;
  destination_link?: string;
  cover_url?: string;
  thumb_offset?: number;
}

export interface ThreadsParams {
  format?: ThreadsFormat;
}

export interface TwitterParams {
  format?: TwitterFormat;
}

export interface PlatformParams {
  facebook?: FacebookParams;
  instagram?: InstagramParams;
  tiktok?: TikTokParams;
  linkedin?: LinkedInParams;
  youtube?: YouTubeParams;
  pinterest?: PinterestParams;
  threads?: ThreadsParams;
  twitter?: TwitterParams;
}
