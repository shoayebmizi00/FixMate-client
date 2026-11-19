import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { dashboardPathForRole } from "@/lib/dashboard";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.redirect(
    new URL(dashboardPathForRole(session.user.role), request.url)
  );
}
