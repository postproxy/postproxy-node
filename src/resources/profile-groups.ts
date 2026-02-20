import type { PostProxy } from "../client";
import type {
  ProfileGroup,
  ListResponse,
  DeleteResponse,
  ConnectionResponse,
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

  async create(name: string): Promise<ProfileGroup> {
    return (await this.client.request("POST", "/profile_groups", {
      json: { profile_group: { name } },
    })) as ProfileGroup;
  }

  async delete(id: string): Promise<DeleteResponse> {
    return (await this.client.request(
      "DELETE",
      `/profile_groups/${id}`,
    )) as DeleteResponse;
  }

  async initializeConnection(
    id: string,
    platform: Platform,
    redirectUrl: string,
  ): Promise<ConnectionResponse> {
    return (await this.client.request(
      "POST",
      `/profile_groups/${id}/initialize_connection`,
      {
        json: { platform, redirect_url: redirectUrl },
      },
    )) as ConnectionResponse;
  }
}
