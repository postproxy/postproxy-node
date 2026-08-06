import type { PostProxy } from "../client";
import type { PostSyncStatus, PostSyncTrigger } from "../constants";
import type {
  Profile,
  Placement,
  AssignedPlacement,
  IceBreaker,
  IceBreakersResponse,
  ListResponse,
  PaginatedResponse,
  PostSync,
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
    options: { profileGroupId?: string; idempotencyKey?: string } = {},
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
        idempotencyKey: options.idempotencyKey,
      },
    )) as AssignedPlacement;
  }

  // Walks the profile's feed backwards from the newest post until it reaches
  // `from` or the platform stops returning posts. Runs in the background —
  // poll `postSync()` with the returned id for progress. Only one backfill
  // runs per profile; starting a second throws a `ConflictError` carrying the
  // running one's `profile_sync_id`.
  async backfillPosts(
    id: string,
    params: { from: string },
    options: { profileGroupId?: string; idempotencyKey?: string } = {},
  ): Promise<PostSync> {
    return (await this.client.request(
      "POST",
      `/profiles/${id}/backfill_posts`,
      {
        json: { from: params.from },
        profileGroupId: options.profileGroupId,
        idempotencyKey: options.idempotencyKey,
      },
    )) as PostSync;
  }

  // Post sync runs for a profile, newest first. Runs are kept for 30 days.
  async postSyncs(
    id: string,
    options: {
      trigger?: PostSyncTrigger;
      status?: PostSyncStatus;
      page?: number;
      perPage?: number;
      profileGroupId?: string;
    } = {},
  ): Promise<PaginatedResponse<PostSync>> {
    const params: Record<string, string> = {};
    if (options.trigger) params.trigger = options.trigger;
    if (options.status) params.status = options.status;
    if (options.page != null) params.page = String(options.page);
    if (options.perPage != null) params.per_page = String(options.perPage);

    return (await this.client.request("GET", `/profiles/${id}/post_syncs`, {
      params,
      profileGroupId: options.profileGroupId,
    })) as PaginatedResponse<PostSync>;
  }

  // A single run — poll this to follow a backfill to completion. The run is
  // finished when `status` is `completed` or `failed`.
  async postSync(
    id: string,
    postSyncId: string,
    options: { profileGroupId?: string } = {},
  ): Promise<PostSync> {
    return (await this.client.request(
      "GET",
      `/profiles/${id}/post_syncs/${postSyncId}`,
      { profileGroupId: options.profileGroupId },
    )) as PostSync;
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
    options: { profileGroupId?: string; idempotencyKey?: string } = {},
  ): Promise<SuccessResponse> {
    return (await this.client.request("POST", `/profiles/${id}/ice_breakers`, {
      json: { ice_breakers: iceBreakers },
      profileGroupId: options.profileGroupId,
      idempotencyKey: options.idempotencyKey,
    })) as SuccessResponse;
  }

  async deleteIceBreakers(
    id: string,
    options: { profileGroupId?: string; idempotencyKey?: string } = {},
  ): Promise<SuccessResponse> {
    return (await this.client.request(
      "DELETE",
      `/profiles/${id}/ice_breakers`,
      {
        profileGroupId: options.profileGroupId,
        idempotencyKey: options.idempotencyKey,
      },
    )) as SuccessResponse;
  }

  async delete(
    id: string,
    options: { profileGroupId?: string; idempotencyKey?: string } = {},
  ): Promise<SuccessResponse> {
    return (await this.client.request("DELETE", `/profiles/${id}`, {
      profileGroupId: options.profileGroupId,
      idempotencyKey: options.idempotencyKey,
    })) as SuccessResponse;
  }
}
