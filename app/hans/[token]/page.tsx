import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { validToken } from "@/lib/hans/auth";
import HansDemo from "./HansDemo";

// Hans – AI offer assistant for the fictional company "AluPlast Demo" (university project).
// Reachable only via /hans/<HANS_DEMO_TOKEN>; any other token is a 404.
export const metadata: Metadata = {
  title: "AluPlast Demo – Hans (university project)",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!validToken(token)) notFound();
  return <HansDemo token={token} />;
}
