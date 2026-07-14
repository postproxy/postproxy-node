import type {
  Platform,
  ProfileStatus,
  PostStatus,
  PlatformPostStatus,
  MediaStatus,
  InstagramFormat,
  FacebookFormat,
  TikTokFormat,
  LinkedInFormat,
  YouTubeFormat,
  PinterestFormat,
  ThreadsFormat,
  TwitterFormat,
  BlueskyFormat,
  TelegramFormat,
  TikTokPrivacy,
  YouTubePrivacy,
  TelegramParseMode,
  MessageDirection,
  MessageStatus,
  WebhookEventType,
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
  metadata?: Record<string, unknown> | null;
}

export interface AssignedPlacement {
  id: string;
  name: string;
  metadata: Record<string, unknown> | null;
  profile_group_id: string;
}

export interface IceBreaker {
  question: string;
  payload: string;
  [key: string]: unknown;
}

export interface IceBreakersResponse {
  ice_breakers: IceBreaker[];
}

export interface Insights {
  impressions: number | null;
  on: string | null;
}

export interface ErrorDetails {
  platform_error_code: string | null;
  platform_error_subcode: string | null;
  platform_error_message: string | null;
  postproxy_note: string | null;
}

export interface PlatformResult {
  platform: Platform;
  status: PlatformPostStatus;
  params: Record<string, unknown> | null;
  error: string | null;
  error_details: ErrorDetails | null;
  attempted_at: string | null;
  insights: Insights | null;
}

export interface MediaPlatformError {
  platform: Platform;
  status: PlatformPostStatus;
  error: string | null;
  error_details: ErrorDetails | null;
}

export interface Media {
  id: string;
  status: MediaStatus;
  error_message: string | null;
  content_type: string;
  source_url: string | null;
  url: string | null;
  platforms?: MediaPlatformError[];
}

export interface ThreadChild {
  id: string;
  body: string;
  media: Media[];
}

export interface ThreadChildInput {
  body: string;
  media?: string[];
  mediaFiles?: string[];
}

export interface Post {
  id: string;
  body: string;
  status: PostStatus;
  scheduled_at: string | null;
  created_at: string;
  queue_id?: string | null;
  queue_priority?: string | null;
  media: Media[];
  platforms: PlatformResult[];
  thread: ThreadChild[];
}

// --- Queue Models ---

export interface Timeslot {
  id: number;
  day: number;
  time: string;
}

export interface Queue {
  id: string;
  name: string;
  description: string | null;
  timezone: string;
  enabled: boolean;
  jitter: number;
  profile_group_id: string;
  timeslots: Timeslot[];
  posts_count: number;
}

export interface NextSlotResponse {
  next_slot: string;
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

export interface DeletingPlatform {
  post_profile_id: string;
  platform: Platform;
}

export interface DeleteOnPlatformResponse {
  success: boolean;
  deleting: DeletingPlatform[];
}

export interface SuccessResponse {
  success: boolean;
}

// --- Connection Models ---

export interface OAuthConnectionResponse {
  url: string;
  success: boolean;
}

export interface SyncProfile {
  id: string;
  network: Platform;
  name: string;
  external_username: string | null;
}

export interface BlueskyConnectionResponse {
  success: boolean;
  profile: SyncProfile;
}

export interface TelegramConnectionResponse {
  success: boolean;
  profile: SyncProfile;
  next_step?: string;
}

// Generic shape returned by initializeConnection — caller narrows by `platform`.
export type ConnectionResponse =
  | OAuthConnectionResponse
  | BlueskyConnectionResponse
  | TelegramConnectionResponse;

// --- Stats Models ---

export interface StatsRecord {
  stats: Record<string, number | string | null>;
  recorded_at: string;
}

export interface PlatformStats {
  profile_id: string;
  platform: Platform;
  records: StatsRecord[];
}

export interface PostStats {
  platforms: PlatformStats[];
}

export interface StatsResponse {
  data: Record<string, PostStats>;
}

export interface ProfileStats {
  profile_id: string;
  platform: Platform;
  placement_id: string | null;
  records: StatsRecord[];
}

export interface ProfileStatsResponse {
  data: ProfileStats;
}

// --- Comment Models ---

export interface ProfileComment {
  id: string;
  external_id: string;
  parent_external_id: string | null;
  placement_id: string;
  body: string;
  status: string;
  author_username: string | null;
  author_avatar_url: string | null;
  platform_data: Record<string, unknown> | null;
  posted_at: string;
  created_at: string;
  replies: ProfileComment[];
}

// Shared by both Comment.attachments and Message.attachments.
export interface Attachment {
  id: string;
  type: string;
  url: string | null;
  status: MediaStatus;
  external_id: string | null;
}

export interface Comment {
  id: string;
  external_id: string | null;
  body: string;
  status: string;
  author_username: string | null;
  author_avatar_url: string | null;
  author_external_id: string | null;
  metadata: Record<string, unknown> | null;
  parent_external_id: string | null;
  like_count: number;
  is_hidden: boolean;
  permalink: string | null;
  platform_data: Record<string, unknown> | null;
  attachments: Attachment[];
  posted_at: string | null;
  created_at: string;
  replies: Comment[];
}

export interface AcceptedResponse {
  accepted: boolean;
}

// --- Direct Message Models ---

export interface Reaction {
  sender_external_id: string;
  emoji: string | null;
  reaction: string | null;
  at: string | null;
}

export interface Chat {
  id: string;
  profile_id: string;
  platform: Platform;
  participant_external_id: string;
  participant_username: string | null;
  participant_name: string | null;
  participant_avatar_url: string | null;
  external_conversation_id: string | null;
  last_inbound_at: string | null;
  last_outbound_at: string | null;
  last_message_at: string | null;
  metadata: Record<string, unknown> | null;
  // Bluesky-only; absent for other platforms.
  archived?: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  external_id: string | null;
  direction: MessageDirection;
  body: string | null;
  status: MessageStatus;
  tag: string | null;
  external_comment_id: string | null;
  error_message: string | null;
  platform_data: Record<string, unknown> | null;
  external_posted_at: string | null;
  external_delivered_at: string | null;
  external_read_at: string | null;
  external_edited_at: string | null;
  reply_to_external_id: string | null;
  reply_markup: Record<string, unknown> | null;
  external_deleted_at: string | null;
  reactions: Reaction[];
  attachments: Attachment[];
  is_unsupported: boolean;
  created_at: string;
}

// --- Webhook Models ---

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  enabled: boolean;
  description: string | null;
  secret?: string;
  created_at: string;
  updated_at: string;
}

export interface WebhookDelivery {
  id: string;
  event_id: string;
  event_type: string;
  response_status: number | null;
  attempt_number: number;
  success: boolean;
  attempted_at: string;
  created_at: string;
}

// --- Webhook Event Payloads ---

export interface PostProcessedData {
  id: string;
  body: string;
  status: PostStatus;
  scheduled_at: string | null;
  created_at: string;
  platforms: { id: string; platform: Platform; name: string }[];
}

export interface PostImportedData {
  id: string;
  body: string;
  source: "imported";
  posted_at: string | null;
  created_at: string;
  platform: Platform;
  profile: { id: string; name: string; platform: Platform };
  platform_post_id: string;
  public_id: string | null;
}

export interface PlatformPostData {
  id: string;
  post_id: string;
  platform: Platform;
  profile_id: string;
  profile_name: string;
  status: PlatformPostStatus;
  error: string | null;
  error_details: ErrorDetails | null;
  platform_id: string | null;
}

export interface PlatformPostInsightsData extends PlatformPostData {
  insights: Record<string, number | string | null>;
}

export interface ProfileEventData {
  id: string;
  name: string;
  platform: Platform;
  profile_group_id: string;
  status: "active" | "disconnected";
  uid: string;
  username: string | null;
}

export interface ProfileStatsData {
  profile_id: string;
  platform: Platform;
  placement_id: string | null;
  stats: Record<string, number | string | null>;
  recorded_at: string;
}

export interface MediaFailedData {
  id: string;
  post_id: string;
  content_type: string;
  status: "failed";
  error_message: string;
}

export interface CommentCreatedData {
  id: string;
  post_id: string;
  platform_post_id: string;
  platform: Platform;
  external_id: string | null;
  parent_external_id: string | null;
  body: string;
  status: string;
  author_external_id: string | null;
  author_name: string | null;
  author_username: string | null;
  author_avatar_url: string | null;
  like_count: number;
  reply_count: number;
  is_hidden: boolean;
  permalink: string | null;
  platform_data: Record<string, unknown> | null;
  posted_at: string | null;
  created_at: string;
}

export interface MessageEventData {
  message: Message;
}

export interface ReactionEventData {
  message: Message;
  sender_external_id: string;
  action: "react" | "unreact";
  reaction: string | null;
  emoji: string | null;
  occurred_at: string | null;
}

export interface ProfileCommentCreatedData {
  id: string;
  profile_id: string;
  platform: Platform;
  placement_id: string | null;
  external_id: string | null;
  parent_external_id: string | null;
  body: string;
  status: string;
  author_username: string | null;
  author_avatar_url: string | null;
  platform_data: Record<string, unknown> | null;
  posted_at: string | null;
  created_at: string;
}

interface BaseWebhookEvent<T extends WebhookEventType, D> {
  id: string;
  type: T;
  created_at: string;
  data: D;
}

export type WebhookEvent =
  | BaseWebhookEvent<"post.processed", PostProcessedData>
  | BaseWebhookEvent<"post.imported", PostImportedData>
  | BaseWebhookEvent<"platform_post.published", PlatformPostData>
  | BaseWebhookEvent<"platform_post.failed", PlatformPostData>
  | BaseWebhookEvent<"platform_post.failed_waiting_for_retry", PlatformPostData>
  | BaseWebhookEvent<"platform_post.insights", PlatformPostInsightsData>
  | BaseWebhookEvent<"profile.connected", ProfileEventData>
  | BaseWebhookEvent<"profile.disconnected", ProfileEventData>
  | BaseWebhookEvent<"profile.stats", ProfileStatsData>
  | BaseWebhookEvent<"media.failed", MediaFailedData>
  | BaseWebhookEvent<"comment.created", CommentCreatedData>
  | BaseWebhookEvent<"profile_comment.created", ProfileCommentCreatedData>
  | BaseWebhookEvent<"message.received", MessageEventData>
  | BaseWebhookEvent<"message.sent", MessageEventData>
  | BaseWebhookEvent<"message.delivered", MessageEventData>
  | BaseWebhookEvent<"message.read", MessageEventData>
  | BaseWebhookEvent<"message.edited", MessageEventData>
  | BaseWebhookEvent<"message.deleted", MessageEventData>
  | BaseWebhookEvent<"message.failed_waiting_for_retry", MessageEventData>
  | BaseWebhookEvent<"message.failed", MessageEventData>
  | BaseWebhookEvent<"reaction.received", ReactionEventData>;

// --- Platform Parameter Models ---

export interface FacebookParams {
  format?: FacebookFormat;
  title?: string;
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
  made_for_kids?: boolean;
  tags?: string[];
  category_id?: string;
  contains_synthetic_media?: boolean;
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
  /** Required when format is "poll": 2-4 options, max 25 characters each. */
  poll_options?: string[];
  /** Required when format is "poll": 5 to 10080 minutes (7 days). */
  poll_duration_minutes?: number;
}

export interface BlueskyParams {
  format?: BlueskyFormat;
}

export interface TelegramParams {
  format?: TelegramFormat;
  chat_id: string;
  parse_mode?: TelegramParseMode;
  disable_link_preview?: boolean;
  disable_notification?: boolean;
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
  bluesky?: BlueskyParams;
  telegram?: TelegramParams;
  google_business?: Record<string, unknown>;
}
