import { timingSafeEqual } from "node:crypto";

/**
 * The demo at /hans is behind HTTP Basic Auth (the browser's login prompt), enforced in proxy.ts
 * and checked again by every page and API route. Credentials come from HANS_USER and HANS_PASSWORD;
 * if either is unset, nobody gets in.
 */
const same = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export function authorized(authHeader: string | null | undefined): boolean {
  const user = process.env.HANS_USER, pass = process.env.HANS_PASSWORD;
  if (!user || !pass || !authHeader?.startsWith("Basic ")) return false;
  let decoded: string;
  try {
    decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf8");
  } catch {
    return false;
  }
  const i = decoded.indexOf(":");
  if (i < 0) return false;
  return same(decoded.slice(0, i), user) && same(decoded.slice(i + 1), pass);
}
