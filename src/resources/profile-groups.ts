import type { PostProxy } from "../client";
import type {
  ProfileGroup,
  ListResponse,
  DeleteResponse,
  ConnectionResponse,
  OAuthConnectionResponse,
  BlueskyConnectionResponse,
  TelegramConnectionResponse,
} from "../types";
import type { Platform } from "../constants";

export class ProfileGroupsResource {
  private client: PostProxy;

  constructor(client: PostProxy) {
    this.client = client;
  }

  async list(): Promise<ListResponse<ProfileGroup>> {
    return (await this.client.request("GET", "/profile_groups")) as ListResponse<ProfileGroup>;
  }

  async get(id: string): Promise<ProfileGroup> {
    return (await this.client.request(
      "GET",
      `/profile_groups/${id}`,
    )) as ProfileGroup;
  }

  async create(
    name: string,
    options: { idempotencyKey?: string } = {},
  ): Promise<ProfileGroup> {
    return (await this.client.request("POST", "/profile_groups", {
      json: { profile_group: { name } },
      idempotencyKey: options.idempotencyKey,
    })) as ProfileGroup;
  }

  async delete(
    id: string,
    options: { idempotencyKey?: string } = {},
  ): Promise<DeleteResponse> {
    return (await this.client.request("DELETE", `/profile_groups/${id}`, {
      idempotencyKey: options.idempotencyKey,
    })) as DeleteResponse;
  }

  // OAuth platforms require `redirectUrl`. BlueSky and Telegram have dedicated helpers
  // (`connectBluesky`, `connectTelegram`) — prefer those for type-safe payloads.
  async initializeConnection(
    id: string,
    platform: Platform,
    redirectUrl?: string,
    extra: Record<string, unknown> = {},
  ): Promise<ConnectionResponse> {
    const body: Record<string, unknown> = { platform, ...extra };
    if (redirectUrl) body.redirect_url = redirectUrl;

    return (await this.client.request(
      "POST",
      `/profile_groups/${id}/initialize_connection`,
      { json: body },
    )) as ConnectionResponse;
  }

  async connectBluesky(
    id: string,
    options: { identifier: string; appPassword: string },
  ): Promise<BlueskyConnectionResponse> {
    return (await this.client.request(
      "POST",
      `/profile_groups/${id}/initialize_connection`,
      {
        json: {
          platform: "bluesky",
          identifier: options.identifier,
          app_password: options.appPassword,
        },
      },
    )) as BlueskyConnectionResponse;
  }

  // After this call, poll `profiles.placements(profile.id)` until the user has
  // added the bot as administrator to one or more channels.
  async connectTelegram(
    id: string,
    options: { botToken: string },
  ): Promise<TelegramConnectionResponse> {
    return (await this.client.request(
      "POST",
      `/profile_groups/${id}/initialize_connection`,
      {
        json: { platform: "telegram", bot_token: options.botToken },
      },
    )) as TelegramConnectionResponse;
  }

  async connectOAuth(
    id: string,
    platform: Platform,
    redirectUrl: string,
  ): Promise<OAuthConnectionResponse> {
    return (await this.initializeConnection(
      id,
      platform,
      redirectUrl,
    )) as OAuthConnectionResponse;
  }
}
