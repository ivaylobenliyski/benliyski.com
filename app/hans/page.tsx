import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { authorized } from "@/lib/hans/auth";
import HansDemo from "./HansDemo";

// Hans – AI offer assistant for the fictional company "AluPlast Demo" (university project).
// Password-protected (HTTP Basic Auth, see proxy.ts).
export const metadata: Metadata = {
  title: "AluPlast Demo – Hans (university project)",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function Page() {
  if (!authorized((await headers()).get("authorization"))) notFound();
  return <HansDemo />;
}
