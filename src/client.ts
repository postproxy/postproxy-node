import { BASE_URL, VERSION } from "./constants";
import {
  PostProxyError,
  AuthenticationError,
  NotFoundError,
  ValidationError,
  BadRequestError,
} from "./exceptions";
import { PostsResource } from "./resources/posts";
import { ProfilesResource } from "./resources/profiles";
import { ProfileGroupsResource } from "./resources/profile-groups";
import { WebhooksResource } from "./resources/webhooks";
import { QueuesResource } from "./resources/queues";
import { CommentsResource } from "./resources/comments";
import { ProfileCommentsResource } from "./resources/profile-comments";

export interface PostProxyOptions {
  baseUrl?: string;
  profileGroupId?: string;
}

export class PostProxy {
  private apiKey: string;
  private baseUrl: string;
  private defaultProfileGroupId: string | null;

  readonly posts: PostsResource;
  readonly profiles: ProfilesResource;
  readonly profileGroups: ProfileGroupsResource;
  readonly webhooks: WebhooksResource;
  readonly queues: QueuesResource;
  readonly comments: CommentsResource;
  readonly profileComments: ProfileCommentsResource;

  constructor(apiKey: string, options: PostProxyOptions = {}) {
    this.apiKey = apiKey;
    this.baseUrl = options.baseUrl ?? BASE_URL;
    this.defaultProfileGroupId = options.profileGroupId ?? null;

    this.posts = new PostsResource(this);
    this.profiles = new ProfilesResource(this);
    this.profileGroups = new ProfileGroupsResource(this);
    this.webhooks = new WebhooksResource(this);
    this.queues = new QueuesResource(this);
    this.comments = new CommentsResource(this);
    this.profileComments = new ProfileCommentsResource(this);
  }

  async request(
    method: string,
    path: string,
    options: {
      params?: Record<string, string>;
      json?: Record<string, unknown>;
      formData?: FormData;
      profileGroupId?: string | null;
    } = {},
  ): Promise<unknown> {
    const { params, json, formData, profileGroupId } = options;

    const url = new URL(`/api${path}`, this.baseUrl);

    // Add query parameters
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    }

    // Add profile_group_id to query params
    const pgId = profileGroupId ?? this.defaultProfileGroupId;
    if (pgId) {
      url.searchParams.set("profile_group_id", pgId);
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      "User-Agent": `postproxy-node/${VERSION} (node/${process.version})`,
    };

    let body: string | FormData | undefined;

    if (formData) {
      body = formData;
    } else if (json) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(json);
    }

    const response = await fetch(url.toString(), {
      method,
      headers,
      body,
    });

    if (response.status === 204) {
      return null;
    }

    let responseBody: Record<string, unknown> | null = null;
    try {
      responseBody = (await response.json()) as Record<string, unknown>;
    } catch {
      // Response body is not JSON
    }

    if (response.ok) {
      return responseBody;
    }

    const message =
      (responseBody?.error as string) ??
      (responseBody?.message as string) ??
      response.statusText;

    switch (response.status) {
      case 401:
        throw new AuthenticationError(message, responseBody);
      case 404:
        throw new NotFoundError(message, responseBody);
      case 422:
        throw new ValidationError(message, responseBody);
      case 400:
        throw new BadRequestError(message, responseBody);
      default:
        throw new PostProxyError(message, response.status, responseBody);
    }
  }
}
