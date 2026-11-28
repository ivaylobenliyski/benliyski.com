import { message } from "@/lib/hans/api";

// Hans demo (university project) – reachable only with the secret token in the URL.
export const maxDuration = 60;

export async function POST(req: Request, ctx: { params: Promise<{ token: string }> }) {
  return message(req, ctx.params);
}
