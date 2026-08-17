import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import type { PostProxy } from "../client";
import type {
  Message,
  MessageButton,
  MessageCard,
  PaginatedResponse,
  QuickReply,
} from "../types";
import type { MessageDirection, MessageStatus } from "../constants";

function getMimeType(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    mp4: "video/mp4",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
    webm: "video/webm",
  };
  return mimeTypes[ext ?? ""] ?? "application/octet-stream";
}

export class MessagesResource {
  private client: PostProxy;

  constructor(client: PostProxy) {
    this.client = client;
  }

  async list(
    chatId: string,
    options: {
      page?: number;
      perPage?: number;
      direction?: MessageDirection;
      status?: MessageStatus;
      profileGroupId?: string;
    } = {},
  ): Promise<PaginatedResponse<Message>> {
    const params: Record<string, string> = {};

    if (options.page != null) params.page = String(options.page);
    if (options.perPage != null) params.per_page = String(options.perPage);
    if (options.direction) params.direction = options.direction;
    if (options.status) params.status = options.status;

    return (await this.client.request("GET", `/chats/${chatId}/messages`, {
      params,
      profileGroupId: options.profileGroupId,
    })) as PaginatedResponse<Message>;
  }

  async send(
    chatId: string,
    options: {
      body?: string;
      media?: string[];
      mediaFiles?: string[];
      tag?: string;
      replyToExternalId?: string;
      replyMarkup?: Record<string, unknown>;
      // Facebook and Instagram only; `422` on Telegram and Bluesky. Sent on the
      // JSON path only — pass `media` as URLs rather than `mediaFiles` when
      // combining with an attachment.
      quickReplies?: QuickReply[];
      buttons?: MessageButton[];
      // Requires `buttons`.
      card?: MessageCard;
      profileGroupId?: string;
      idempotencyKey?: string;
    } = {},
  ): Promise<Message> {
    const {
      body,
      media,
      mediaFiles,
      tag,
      replyToExternalId,
      replyMarkup,
      quickReplies,
      buttons,
      card,
      profileGroupId,
      idempotencyKey,
    } = options;

    // Use multipart form data when local files are provided (mirrors PostsResource).
    if (mediaFiles && mediaFiles.length > 0) {
      const formData = new FormData();

      if (body != null) formData.set("body", body);
      if (tag != null) formData.set("tag", tag);
      if (replyToExternalId != null)
        formData.set("reply_to_external_id", replyToExternalId);

      // URL-based media as text parts
      if (media) {
        for (const url of media) {
          formData.append("media[]", url);
        }
      }

      // Local files
      for (const filePath of mediaFiles) {
        const fileData = await readFile(filePath);
        const fileName = basename(filePath);
        const mimeType = getMimeType(filePath);
        const blob = new Blob([fileData], { type: mimeType });
        formData.append("media[]", blob, fileName);
      }

      return (await this.client.request("POST", `/chats/${chatId}/messages`, {
        formData,
        profileGroupId,
        idempotencyKey,
      })) as Message;
    }

    const json: Record<string, unknown> = {};
    if (body != null) json.body = body;
    if (media != null) json.media = media;
    if (tag != null) json.tag = tag;
    if (replyToExternalId != null)
      json.reply_to_external_id = replyToExternalId;
    if (replyMarkup != null) json.reply_markup = replyMarkup;
    if (quickReplies != null) json.quick_replies = quickReplies;
    if (buttons != null) json.buttons = buttons;
    if (card != null) json.card = card;

    return (await this.client.request("POST", `/chats/${chatId}/messages`, {
      json,
      profileGroupId,
      idempotencyKey,
    })) as Message;
  }

  async get(
    messageId: string,
    options: { profileGroupId?: string } = {},
  ): Promise<Message> {
    return (await this.client.request("GET", `/messages/${messageId}`, {
      profileGroupId: options.profileGroupId,
    })) as Message;
  }

  async edit(
    messageId: string,
    options: {
      body?: string;
      replyMarkup?: Record<string, unknown>;
      profileGroupId?: string;
      idempotencyKey?: string;
    } = {},
  ): Promise<Message> {
    const json: Record<string, unknown> = {};
    if (options.body != null) json.body = options.body;
    if (options.replyMarkup != null) json.reply_markup = options.replyMarkup;

    return (await this.client.request("PATCH", `/messages/${messageId}`, {
      json,
      profileGroupId: options.profileGroupId,
      idempotencyKey: options.idempotencyKey,
    })) as Message;
  }

  async react(
    messageId: string,
    options: {
      reaction?: string;
      emoji?: string;
      profileGroupId?: string;
      idempotencyKey?: string;
    } = {},
  ): Promise<Message> {
    const json: Record<string, unknown> = {};
    if (options.reaction != null) json.reaction = options.reaction;
    if (options.emoji != null) json.emoji = options.emoji;

    return (await this.client.request("POST", `/messages/${messageId}/react`, {
      json: Object.keys(json).length > 0 ? json : undefined,
      profileGroupId: options.profileGroupId,
      idempotencyKey: options.idempotencyKey,
    })) as Message;
  }

  async unreact(
    messageId: string,
    options: { profileGroupId?: string; idempotencyKey?: string } = {},
  ): Promise<Message> {
    return (await this.client.request(
      "DELETE",
      `/messages/${messageId}/unreact`,
      {
        profileGroupId: options.profileGroupId,
        idempotencyKey: options.idempotencyKey,
      },
    )) as Message;
  }
}
