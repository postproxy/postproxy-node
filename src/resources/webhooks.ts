import type { PostProxy } from "../client";
import type {
  Webhook,
  WebhookDelivery,
  ListResponse,
  PaginatedResponse,
  DeleteResponse,
} from "../types";

export class WebhooksResource {
  private client: PostProxy;

  constructor(client: PostProxy) {
    this.client = client;
  }

  async list(): Promise<ListResponse<Webhook>> {
    return (await this.client.request("GET", "/webhooks")) as ListResponse<Webhook>;
  }

  async get(id: string): Promise<Webhook> {
    return (await this.client.request("GET", `/webhooks/${id}`)) as Webhook;
  }

  async create(
    url: string,
    events: string[],
    options: { description?: string; idempotencyKey?: string } = {},
  ): Promise<Webhook> {
    const payload: Record<string, unknown> = { url, events };
    if (options.description != null) {
      payload.description = options.description;
    }

    return (await this.client.request("POST", "/webhooks", {
      json: payload,
      idempotencyKey: options.idempotencyKey,
    })) as Webhook;
  }

  async update(
    id: string,
    options: {
      url?: string;
      events?: string[];
      enabled?: boolean;
      description?: string;
      idempotencyKey?: string;
    } = {},
  ): Promise<Webhook> {
    const payload: Record<string, unknown> = {};
    if (options.url != null) payload.url = options.url;
    if (options.events != null) payload.events = options.events;
    if (options.enabled != null) payload.enabled = options.enabled;
    if (options.description != null) payload.description = options.description;

    return (await this.client.request("PATCH", `/webhooks/${id}`, {
      json: payload,
      idempotencyKey: options.idempotencyKey,
    })) as Webhook;
  }

  async delete(
    id: string,
    options: { idempotencyKey?: string } = {},
  ): Promise<DeleteResponse> {
    return (await this.client.request("DELETE", `/webhooks/${id}`, {
      idempotencyKey: options.idempotencyKey,
    })) as DeleteResponse;
  }

  async deliveries(
    id: string,
    options: { page?: number; perPage?: number } = {},
  ): Promise<PaginatedResponse<WebhookDelivery>> {
    const params: Record<string, string> = {};
    if (options.page != null) params.page = String(options.page);
    if (options.perPage != null) params.per_page = String(options.perPage);

    return (await this.client.request("GET", `/webhooks/${id}/deliveries`, {
      params,
    })) as PaginatedResponse<WebhookDelivery>;
  }
}
