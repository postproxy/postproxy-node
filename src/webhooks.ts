import { createHmac, timingSafeEqual } from "node:crypto";
import { WEBHOOK_EVENT_TYPES, type WebhookEventType } from "./constants";
import type { WebhookEvent } from "./types";

export function verifySignature(
  payload: string,
  signatureHeader: string,
  secret: string,
): boolean {
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => p.split("=", 2)),
  );
  const timestamp = parts.t;
  const expected = parts.v1;

  if (!timestamp || !expected) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const computed = createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");

  return timingSafeEqual(Buffer.from(computed), Buffer.from(expected));
}

const EVENT_TYPE_SET: ReadonlySet<string> = new Set(WEBHOOK_EVENT_TYPES);

function isKnownEventType(value: unknown): value is WebhookEventType {
  return typeof value === "string" && EVENT_TYPE_SET.has(value);
}

export class WebhookParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebhookParseError";
  }
}

// Parse a raw webhook body (string or pre-parsed object) into a discriminated
// WebhookEvent. Throws WebhookParseError if the body doesn't match the envelope
// or the `type` is not a known event.
export function parseWebhookEvent(body: string | object): WebhookEvent {
  let parsed: unknown;
  if (typeof body === "string") {
    try {
      parsed = JSON.parse(body);
    } catch (e) {
      throw new WebhookParseError(`Invalid JSON: ${(e as Error).message}`);
    }
  } else {
    parsed = body;
  }

  if (!parsed || typeof parsed !== "object") {
    throw new WebhookParseError("Webhook body is not an object");
  }

  const envelope = parsed as Record<string, unknown>;
  const { type } = envelope;

  if (!isKnownEventType(type)) {
    throw new WebhookParseError(`Unknown webhook event type: ${String(type)}`);
  }

  return envelope as unknown as WebhookEvent;
}
