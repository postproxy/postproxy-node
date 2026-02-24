export { PostProxy } from "./client";
export type { PostProxyOptions } from "./client";

export {
  type Platform,
  type ProfileStatus,
  type PostStatus,
  type PlatformPostStatus,
  type InstagramFormat,
  type FacebookFormat,
  type TikTokFormat,
  type LinkedInFormat,
  type YouTubeFormat,
  type PinterestFormat,
  type ThreadsFormat,
  type TwitterFormat,
  type TikTokPrivacy,
  type YouTubePrivacy,
  BASE_URL,
} from "./constants";

export {
  PostProxyError,
  AuthenticationError,
  BadRequestError,
  NotFoundError,
  ValidationError,
} from "./exceptions";

export type {
  Profile,
  ProfileGroup,
  Placement,
  Insights,
  PlatformResult,
  Post,
  ListResponse,
  PaginatedResponse,
  DeleteResponse,
  SuccessResponse,
  ConnectionResponse,
  FacebookParams,
  InstagramParams,
  TikTokParams,
  LinkedInParams,
  YouTubeParams,
  PinterestParams,
  ThreadsParams,
  TwitterParams,
  PlatformParams,
  StatsRecord,
  PlatformStats,
  PostStats,
  StatsResponse,
} from "./types";
