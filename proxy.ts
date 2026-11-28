import { NextResponse, type NextRequest } from "next/server";
import { authorized } from "@/lib/hans/auth";

// Password-protects the Hans demo (university project): the browser shows its login prompt.
export function proxy(request: NextRequest) {
  if (authorized(request.headers.get("authorization"))) return NextResponse.next();
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Hans demo", charset="UTF-8"', "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
  });
}

export const config = {
  matcher: ["/hans", "/hans/:path*", "/api/hans/:path*"],
};
