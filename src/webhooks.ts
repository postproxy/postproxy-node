import { createHmac, timingSafeEqual } from "node:crypto";

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
