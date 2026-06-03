import type { PostProxy } from "../client";
import type {
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

  async list(
    postId: string,
    profileId: string,
    options: {
      page?: number;
      perPage?: number;
      profileGroupId?: string;
    } = {},
  ): Promise<PaginatedResponse<Comment>> {
    const params: Record<string, string> = {
      profile_id: profileId,
    };

    if (options.page != null) params.page = String(options.page);
    if (options.perPage != null) params.per_page = String(options.perPage);

    return (await this.client.request("GET", `/posts/${postId}/comments`, {
      params,
      profileGroupId: options.profileGroupId,
    })) as PaginatedResponse<Comment>;
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
    })) as Comment;
  }

  async delete(
    postId: string,
    commentId: string,
    profileId: string,
    options: { profileGroupId?: string } = {},
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
      },
    )) as AcceptedResponse;
  }

  async hide(
    postId: string,
    commentId: string,
    profileId: string,
    options: { profileGroupId?: string } = {},
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
      },
    )) as AcceptedResponse;
  }

  async unhide(
    postId: string,
    commentId: string,
    profileId: string,
    options: { profileGroupId?: string } = {},
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
      },
    )) as AcceptedResponse;
  }

  async like(
    postId: string,
    commentId: string,
    profileId: string,
    options: { profileGroupId?: string } = {},
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
      },
    )) as AcceptedResponse;
  }

  async unlike(
    postId: string,
    commentId: string,
    profileId: string,
    options: { profileGroupId?: string } = {},
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
    options: { profileGroupId?: string } = {},
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
      },
    )) as Message;
  }
}
