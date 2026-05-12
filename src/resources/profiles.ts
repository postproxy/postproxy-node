import type { PostProxy } from "../client";
import type {
  Profile,
  Placement,
  ListResponse,
  SuccessResponse,
  ProfileStatsResponse,
} from "../types";

export class ProfilesResource {
  private client: PostProxy;

  constructor(client: PostProxy) {
    this.client = client;
  }

  async list(
    options: { profileGroupId?: string } = {},
  ): Promise<ListResponse<Profile>> {
    return (await this.client.request("GET", "/profiles", {
      profileGroupId: options.profileGroupId,
    })) as ListResponse<Profile>;
  }

  async get(
    id: string,
    options: { profileGroupId?: string } = {},
  ): Promise<Profile> {
    return (await this.client.request("GET", `/profiles/${id}`, {
      profileGroupId: options.profileGroupId,
    })) as Profile;
  }

  async placements(
    id: string,
    options: { profileGroupId?: string } = {},
  ): Promise<ListResponse<Placement>> {
    return (await this.client.request("GET", `/profiles/${id}/placements`, {
      profileGroupId: options.profileGroupId,
    })) as ListResponse<Placement>;
  }

  // `placementId` is required for facebook, linkedin, and telegram profiles.
  async getProfileStats(
    id: string,
    options: {
      placementId?: string;
      from?: string;
      to?: string;
      profileGroupId?: string;
    } = {},
  ): Promise<ProfileStatsResponse> {
    const params: Record<string, string> = {};
    if (options.placementId) params.placement_id = options.placementId;
    if (options.from) params.from = options.from;
    if (options.to) params.to = options.to;

    return (await this.client.request("GET", `/profiles/${id}/stats`, {
      params,
      profileGroupId: options.profileGroupId,
    })) as ProfileStatsResponse;
  }

  async delete(
    id: string,
    options: { profileGroupId?: string } = {},
  ): Promise<SuccessResponse> {
    return (await this.client.request("DELETE", `/profiles/${id}`, {
      profileGroupId: options.profileGroupId,
    })) as SuccessResponse;
  }
}
