import { start } from "@/lib/hans/api";

// Hans demo (university project) – password-protected, see proxy.ts.
export const maxDuration = 60;

export async function POST(req: Request) {
  return start(req);
}
