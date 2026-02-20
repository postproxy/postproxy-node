import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import type { PostProxy } from "../client";
import type {
  Post,
  PaginatedResponse,
  DeleteResponse,
  PlatformParams,
} from "../types";
import type { PostStatus, Platform } from "../constants";

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

export class PostsResource {
  private client: PostProxy;

  constructor(client: PostProxy) {
    this.client = client;
  }

  async list(options: {
    page?: number;
    perPage?: number;
    status?: PostStatus;
    platforms?: Platform[];
    scheduledAfter?: Date | string;
    profileGroupId?: string;
  } = {}): Promise<PaginatedResponse<Post>> {
    const params: Record<string, string> = {};

    if (options.page != null) params.page = String(options.page);
    if (options.perPage != null) params.per_page = String(options.perPage);
    if (options.status) params.status = options.status;
    if (options.platforms) params.platforms = options.platforms.join(",");
    if (options.scheduledAfter) {
      params.scheduled_after =
        options.scheduledAfter instanceof Date
          ? options.scheduledAfter.toISOString()
          : options.scheduledAfter;
    }

    return (await this.client.request("GET", "/posts", {
      params,
      profileGroupId: options.profileGroupId,
    })) as PaginatedResponse<Post>;
  }

  async get(
    id: string,
    options: { profileGroupId?: string } = {},
  ): Promise<Post> {
    return (await this.client.request("GET", `/posts/${id}`, {
      profileGroupId: options.profileGroupId,
    })) as Post;
  }

  async create(
    body: string,
    profiles: string[],
    options: {
      media?: string[];
      mediaFiles?: string[];
      platforms?: PlatformParams;
      scheduledAt?: Date | string;
      draft?: boolean;
      profileGroupId?: string;
    } = {},
  ): Promise<Post> {
    const { media, mediaFiles, platforms, scheduledAt, draft, profileGroupId } =
      options;

    // Use multipart form data for file uploads
    if (mediaFiles && mediaFiles.length > 0) {
      const formData = new FormData();
      formData.set("post[body]", body);

      for (const profileId of profiles) {
        formData.append("profiles[]", profileId);
      }

      if (scheduledAt) {
        formData.set(
          "post[scheduled_at]",
          scheduledAt instanceof Date
            ? scheduledAt.toISOString()
            : scheduledAt,
        );
      }

      if (draft != null) {
        formData.set("post[draft]", String(draft));
      }

      // Add platform params as flat form fields
      if (platforms) {
        for (const [platform, params] of Object.entries(platforms)) {
          if (!params) continue;
          for (const [key, value] of Object.entries(
            params as Record<string, unknown>,
          )) {
            if (value == null) continue;
            if (Array.isArray(value)) {
              for (const item of value) {
                formData.append(
                  `platforms[${platform}][${key}][]`,
                  String(item),
                );
              }
            } else {
              formData.set(`platforms[${platform}][${key}]`, String(value));
            }
          }
        }
      }

      // Read and attach files
      for (const filePath of mediaFiles) {
        const fileData = await readFile(filePath);
        const fileName = basename(filePath);
        const mimeType = getMimeType(filePath);
        const blob = new Blob([fileData], { type: mimeType });
        formData.append("media[]", blob, fileName);
      }

      return (await this.client.request("POST", "/posts", {
        formData,
        profileGroupId,
      })) as Post;
    }

    // JSON request for URL-based media
    const payload: Record<string, unknown> = {
      post: {
        body,
        ...(scheduledAt && {
          scheduled_at:
            scheduledAt instanceof Date
              ? scheduledAt.toISOString()
              : scheduledAt,
        }),
        ...(draft != null && { draft }),
      },
      profiles,
      ...(media && { media }),
      ...(platforms && { platforms }),
    };

    return (await this.client.request("POST", "/posts", {
      json: payload,
      profileGroupId,
    })) as Post;
  }

  async publishDraft(
    id: string,
    options: { profileGroupId?: string } = {},
  ): Promise<Post> {
    return (await this.client.request("POST", `/posts/${id}/publish`, {
      profileGroupId: options.profileGroupId,
    })) as Post;
  }

  async delete(
    id: string,
    options: { profileGroupId?: string } = {},
  ): Promise<DeleteResponse> {
    return (await this.client.request("DELETE", `/posts/${id}`, {
      profileGroupId: options.profileGroupId,
    })) as DeleteResponse;
  }
}
