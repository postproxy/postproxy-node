import type { PostProxy } from "../client";
import type {
  ProfileComment,
  PaginatedResponse,
  AcceptedResponse,
} from "../types";

export class ProfileCommentsResource {
  private client: PostProxy;

  constructor(client: PostProxy) {
    this.client = client;
  }

  async list(
    profileId: string,
    options: {
      placementId?: string;
      page?: number;
      perPage?: number;
      profileGroupId?: string;
    } = {},
  ): Promise<PaginatedResponse<ProfileComment>> {
    const params: Record<string, string> = {};
    if (options.placementId != null) params.placement_id = options.placementId;
    if (options.page != null) params.page = String(options.page);
    if (options.perPage != null) params.per_page = String(options.perPage);

    return (await this.client.request(
      "GET",
      `/profiles/${profileId}/comments`,
      {
        params,
        profileGroupId: options.profileGroupId,
      },
    )) as PaginatedResponse<ProfileComment>;
  }

  async get(
    profileId: string,
    commentId: string,
    options: { profileGroupId?: string } = {},
  ): Promise<ProfileComment> {
    return (await this.client.request(
      "GET",
      `/profiles/${profileId}/comments/${commentId}`,
      {
        profileGroupId: options.profileGroupId,
      },
    )) as ProfileComment;
  }

  async create(
    profileId: string,
    parentId: string,
    text: string,
    options: { profileGroupId?: string } = {},
  ): Promise<ProfileComment> {
    return (await this.client.request(
      "POST",
      `/profiles/${profileId}/comments`,
      {
        json: { parent_id: parentId, text },
        profileGroupId: options.profileGroupId,
      },
    )) as ProfileComment;
  }

  async delete(
    profileId: string,
    commentId: string,
    options: { profileGroupId?: string } = {},
  ): Promise<AcceptedResponse> {
    return (await this.client.request(
      "DELETE",
      `/profiles/${profileId}/comments/${commentId}`,
      {
        profileGroupId: options.profileGroupId,
      },
    )) as AcceptedResponse;
  }
}
