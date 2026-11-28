import { timingSafeEqual } from "node:crypto";

/** The demo is reached only via /hans/<HANS_DEMO_TOKEN>. Fails closed if the token is unset or too short. */
export function validToken(t: string | undefined): boolean {
  const secret = process.env.HANS_DEMO_TOKEN;
  if (!secret || secret.length < 16 || !t) return false;
  const a = Buffer.from(t), b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}
