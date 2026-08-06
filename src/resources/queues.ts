import type { PostProxy } from "../client";
import type {
  Queue,
  ListResponse,
  DeleteResponse,
  NextSlotResponse,
} from "../types";

export class QueuesResource {
  private client: PostProxy;

  constructor(client: PostProxy) {
    this.client = client;
  }

  async list(
    options: { profileGroupId?: string } = {},
  ): Promise<ListResponse<Queue>> {
    return (await this.client.request("GET", "/post_queues", {
      profileGroupId: options.profileGroupId,
    })) as ListResponse<Queue>;
  }

  async get(id: string): Promise<Queue> {
    return (await this.client.request(
      "GET",
      `/post_queues/${id}`,
    )) as Queue;
  }

  async nextSlot(id: string): Promise<NextSlotResponse> {
    return (await this.client.request(
      "GET",
      `/post_queues/${id}/next_slot`,
    )) as NextSlotResponse;
  }

  async create(
    name: string,
    profileGroupId: string,
    options: {
      description?: string;
      timezone?: string;
      jitter?: number;
      timeslots?: { day: number; time: string }[];
      idempotencyKey?: string;
    } = {},
  ): Promise<Queue> {
    const postQueue: Record<string, unknown> = { name };
    if (options.description != null) postQueue.description = options.description;
    if (options.timezone != null) postQueue.timezone = options.timezone;
    if (options.jitter != null) postQueue.jitter = options.jitter;
    if (options.timeslots != null)
      postQueue.queue_timeslots_attributes = options.timeslots;

    return (await this.client.request("POST", "/post_queues", {
      json: {
        profile_group_id: profileGroupId,
        post_queue: postQueue,
      },
      idempotencyKey: options.idempotencyKey,
    })) as Queue;
  }

  async update(
    id: string,
    options: {
      name?: string;
      description?: string;
      timezone?: string;
      enabled?: boolean;
      jitter?: number;
      timeslots?: (
        | { day: number; time: string }
        | { id: number; _destroy: true }
      )[];
      idempotencyKey?: string;
    } = {},
  ): Promise<Queue> {
    const postQueue: Record<string, unknown> = {};
    if (options.name != null) postQueue.name = options.name;
    if (options.description != null) postQueue.description = options.description;
    if (options.timezone != null) postQueue.timezone = options.timezone;
    if (options.enabled != null) postQueue.enabled = options.enabled;
    if (options.jitter != null) postQueue.jitter = options.jitter;
    if (options.timeslots != null)
      postQueue.queue_timeslots_attributes = options.timeslots;

    return (await this.client.request("PATCH", `/post_queues/${id}`, {
      json: { post_queue: postQueue },
      idempotencyKey: options.idempotencyKey,
    })) as Queue;
  }

  async delete(
    id: string,
    options: { idempotencyKey?: string } = {},
  ): Promise<DeleteResponse> {
    return (await this.client.request("DELETE", `/post_queues/${id}`, {
      idempotencyKey: options.idempotencyKey,
    })) as DeleteResponse;
  }
}
