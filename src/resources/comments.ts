import type { PostProxy } from "../client";
import type {
  BulkComment,
  Comment,
  Message,
  PaginatedResponse,
  AcceptedResponse,
} from "../types";

export class CommentsResource {
  private client: PostProxy;

  constructor(client: PostProxy) {
    this.client = client;
  }

  // `from` and `to` filter on when PostProxy received the comment
  // (`created_at`), not the platform's `posted_at`. They apply to top-level
  // comments — one in range brings its full `replies` array with it.
  async list(
    postId: string,
    profileId: string,
    options: {
      page?: number;
      perPage?: number;
      from?: string;
      to?: string;
      profileGroupId?: string;
    } = {},
  ): Promise<PaginatedResponse<Comment>> {
    const params: Record<string, string> = {
      profile_id: profileId,
    };

    if (options.page != null) params.page = String(options.page);
    if (options.perPage != null) params.per_page = String(options.perPage);
    if (options.from != null) params.from = options.from;
    if (options.to != null) params.to = options.to;

    return (await this.client.request("GET", `/posts/${postId}/comments`, {
      params,
      profileGroupId: options.profileGroupId,
    })) as PaginatedResponse<Comment>;
  }

  // Comments spanning every post in the profile group. Flat: replies come back
  // as their own entries linked by `parent_external_id`, so `total` counts
  // every comment. `profiles` takes profile IDs or network names, mixed.
  async listAll(
    options: {
      postIds?: string[];
      profiles?: string[];
      from?: string;
      to?: string;
      page?: number;
      perPage?: number;
      profileGroupId?: string;
    } = {},
  ): Promise<PaginatedResponse<BulkComment>> {
    const params: Record<string, string> = {};

    if (options.postIds != null) params.post_ids = options.postIds.join(",");
    if (options.profiles != null) params.profiles = options.profiles.join(",");
    if (options.from != null) params.from = options.from;
    if (options.to != null) params.to = options.to;
    if (options.page != null) params.page = String(options.page);
    if (options.perPage != null) params.per_page = String(options.perPage);

    return (await this.client.request("GET", "/comments", {
      params,
      profileGroupId: options.profileGroupId,
    })) as PaginatedResponse<BulkComment>;
  }

  async get(
    postId: string,
    commentId: string,
    profileId: string,
    options: { profileGroupId?: string } = {},
  ): Promise<Comment> {
    const params: Record<string, string> = {
      profile_id: profileId,
    };

    return (await this.client.request(
      "GET",
      `/posts/${postId}/comments/${commentId}`,
      {
        params,
        profileGroupId: options.profileGroupId,
      },
    )) as Comment;
  }

  async create(
    postId: string,
    profileId: string,
    text: string,
    options: {
      parentId?: string;
      profileGroupId?: string;
      idempotencyKey?: string;
    } = {},
  ): Promise<Comment> {
    const params: Record<string, string> = {
      profile_id: profileId,
    };

    const json: Record<string, unknown> = { text };
    if (options.parentId != null) json.parent_id = options.parentId;

    return (await this.client.request("POST", `/posts/${postId}/comments`, {
      params,
      json,
      profileGroupId: options.profileGroupId,
      idempotencyKey: options.idempotencyKey,
    })) as Comment;
  }

  async delete(
    postId: string,
    commentId: string,
    profileId: string,
    options: { profileGroupId?: string; idempotencyKey?: string } = {},
  ): Promise<AcceptedResponse> {
    const params: Record<string, string> = {
      profile_id: profileId,
    };

    return (await this.client.request(
      "DELETE",
      `/posts/${postId}/comments/${commentId}`,
      {
        params,
        profileGroupId: options.profileGroupId,
        idempotencyKey: options.idempotencyKey,
      },
    )) as AcceptedResponse;
  }

  async hide(
    postId: string,
    commentId: string,
    profileId: string,
    options: { profileGroupId?: string; idempotencyKey?: string } = {},
  ): Promise<AcceptedResponse> {
    const params: Record<string, string> = {
      profile_id: profileId,
    };

    return (await this.client.request(
      "POST",
      `/posts/${postId}/comments/${commentId}/hide`,
      {
        params,
        profileGroupId: options.profileGroupId,
        idempotencyKey: options.idempotencyKey,
      },
    )) as AcceptedResponse;
  }

  async unhide(
    postId: string,
    commentId: string,
    profileId: string,
    options: { profileGroupId?: string; idempotencyKey?: string } = {},
  ): Promise<AcceptedResponse> {
    const params: Record<string, string> = {
      profile_id: profileId,
    };

    return (await this.client.request(
      "POST",
      `/posts/${postId}/comments/${commentId}/unhide`,
      {
        params,
        profileGroupId: options.profileGroupId,
        idempotencyKey: options.idempotencyKey,
      },
    )) as AcceptedResponse;
  }

  async like(
    postId: string,
    commentId: string,
    profileId: string,
    options: { profileGroupId?: string; idempotencyKey?: string } = {},
  ): Promise<AcceptedResponse> {
    const params: Record<string, string> = {
      profile_id: profileId,
    };

    return (await this.client.request(
      "POST",
      `/posts/${postId}/comments/${commentId}/like`,
      {
        params,
        profileGroupId: options.profileGroupId,
        idempotencyKey: options.idempotencyKey,
      },
    )) as AcceptedResponse;
  }

  async unlike(
    postId: string,
    commentId: string,
    profileId: string,
    options: { profileGroupId?: string; idempotencyKey?: string } = {},
  ): Promise<AcceptedResponse> {
    const params: Record<string, string> = {
      profile_id: profileId,
    };

    return (await this.client.request(
      "POST",
      `/posts/${postId}/comments/${commentId}/unlike`,
      {
        params,
        profileGroupId: options.profileGroupId,
        idempotencyKey: options.idempotencyKey,
      },
    )) as AcceptedResponse;
  }

  // Send a direct message in reply to a comment's author (Instagram/Facebook).
  // Returns a Message (not a Comment).
  async privateReply(
    postId: string,
    commentId: string,
    profileId: string,
    text: string,
    options: { profileGroupId?: string; idempotencyKey?: string } = {},
  ): Promise<Message> {
    const params: Record<string, string> = {
      profile_id: profileId,
    };

    return (await this.client.request(
      "POST",
      `/posts/${postId}/comments/${commentId}/private_reply`,
      {
        params,
        json: { text },
        profileGroupId: options.profileGroupId,
        idempotencyKey: options.idempotencyKey,
      },
    )) as Message;
  }
}
