import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { authorized } from "@/lib/hans/auth";
import { FORM_PREFIX, PRICE_LIST, RULES } from "@/lib/hans/generated";
import HansDemo from "./HansDemo";
import type { ProductType } from "./QuickForm";

// Window types + size limits for the quick-quote form (only these fields go to the browser, not the prompt).
const LIMITS = RULES.size_limits_cm as Record<string, { min_w: number; max_w: number; min_h: number; max_h: number }>;
const TYPES: ProductType[] = PRICE_LIST.filter((i) => i.category === "window")
  .map((i) => ({ code: i.code, name: i.name_bg, ...(LIMITS[i.code] ?? LIMITS.default) }))
  .sort((a, b) => Number(b.code === "tilt_turn") - Number(a.code === "tilt_turn")); // most common type first

// Hans – AI offer assistant for the fictional company "AluPlast Demo" (university project).
// Password-protected (HTTP Basic Auth, see proxy.ts).
export const metadata: Metadata = {
  title: "AluPlast Demo – Hans (university project)",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function Page() {
  if (!authorized((await headers()).get("authorization"))) notFound();
  return <HansDemo types={TYPES} formPrefix={FORM_PREFIX} />;
}
