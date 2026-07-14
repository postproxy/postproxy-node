import type { PostProxy } from "../client";
import type {
  Profile,
  Placement,
  AssignedPlacement,
  IceBreaker,
  IceBreakersResponse,
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

  async assignPlacementToGroup(
    id: string,
    params: { placementId: string; targetProfileGroupId: string },
    options: { profileGroupId?: string } = {},
  ): Promise<AssignedPlacement> {
    return (await this.client.request(
      "PATCH",
      `/profiles/${id}/assign_placement_to_group`,
      {
        json: {
          placement_id: params.placementId,
          target_profile_group_id: params.targetProfileGroupId,
        },
        profileGroupId: options.profileGroupId,
      },
    )) as AssignedPlacement;
  }

  // Ice breakers are supported for Instagram profiles only.
  async iceBreakers(
    id: string,
    options: { profileGroupId?: string } = {},
  ): Promise<IceBreakersResponse> {
    return (await this.client.request("GET", `/profiles/${id}/ice_breakers`, {
      profileGroupId: options.profileGroupId,
    })) as IceBreakersResponse;
  }

  async setIceBreakers(
    id: string,
    iceBreakers: IceBreaker[],
    options: { profileGroupId?: string } = {},
  ): Promise<SuccessResponse> {
    return (await this.client.request("POST", `/profiles/${id}/ice_breakers`, {
      json: { ice_breakers: iceBreakers },
      profileGroupId: options.profileGroupId,
    })) as SuccessResponse;
  }

  async deleteIceBreakers(
    id: string,
    options: { profileGroupId?: string } = {},
  ): Promise<SuccessResponse> {
    return (await this.client.request(
      "DELETE",
      `/profiles/${id}/ice_breakers`,
      { profileGroupId: options.profileGroupId },
    )) as SuccessResponse;
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
