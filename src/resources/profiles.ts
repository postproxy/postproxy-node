import type { PostProxy } from "../client";
import type { Profile, Placement, SuccessResponse } from "../types";

export class ProfilesResource {
  private client: PostProxy;

  constructor(client: PostProxy) {
    this.client = client;
  }

  async list(
    options: { profileGroupId?: string } = {},
  ): Promise<Profile[]> {
    const res = (await this.client.request("GET", "/profiles", {
      profileGroupId: options.profileGroupId,
    })) as { data: Profile[] };
    return res.data;
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
  ): Promise<Placement[]> {
    const res = (await this.client.request("GET", `/profiles/${id}/placements`, {
      profileGroupId: options.profileGroupId,
    })) as { data: Placement[] };
    return res.data;
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
