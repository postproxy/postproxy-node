import type { PostProxy } from "../client";
import type { Chat, PaginatedResponse } from "../types";

export class ChatsResource {
  private client: PostProxy;

  constructor(client: PostProxy) {
    this.client = client;
  }

  async list(
    profileId: string,
    options: {
      page?: number;
      perPage?: number;
      before?: Date | string;
      after?: Date | string;
      profileGroupId?: string;
    } = {},
  ): Promise<PaginatedResponse<Chat>> {
    const params: Record<string, string> = {};

    if (options.page != null) params.page = String(options.page);
    if (options.perPage != null) params.per_page = String(options.perPage);
    if (options.before) {
      params.before =
        options.before instanceof Date
          ? options.before.toISOString()
          : options.before;
    }
    if (options.after) {
      params.after =
        options.after instanceof Date
          ? options.after.toISOString()
          : options.after;
    }

    return (await this.client.request("GET", `/profiles/${profileId}/chats`, {
      params,
      profileGroupId: options.profileGroupId,
    })) as PaginatedResponse<Chat>;
  }

  async create(
    profileId: string,
    participantExternalId: string,
    options: {
      participantUsername?: string;
      participantName?: string;
      profileGroupId?: string;
    } = {},
  ): Promise<Chat> {
    const json: Record<string, unknown> = {
      participant_external_id: participantExternalId,
    };
    if (options.participantUsername != null)
      json.participant_username = options.participantUsername;
    if (options.participantName != null)
      json.participant_name = options.participantName;

    return (await this.client.request("POST", `/profiles/${profileId}/chats`, {
      json,
      profileGroupId: options.profileGroupId,
    })) as Chat;
  }

  async get(
    chatId: string,
    options: { profileGroupId?: string } = {},
  ): Promise<Chat> {
    return (await this.client.request("GET", `/chats/${chatId}`, {
      profileGroupId: options.profileGroupId,
    })) as Chat;
  }

  async archive(
    chatId: string,
    options: { profileGroupId?: string } = {},
  ): Promise<Chat> {
    return (await this.client.request("POST", `/chats/${chatId}/archive`, {
      profileGroupId: options.profileGroupId,
    })) as Chat;
  }

  async unarchive(
    chatId: string,
    options: { profileGroupId?: string } = {},
  ): Promise<Chat> {
    return (await this.client.request("DELETE", `/chats/${chatId}/archive`, {
      profileGroupId: options.profileGroupId,
    })) as Chat;
  }
}
