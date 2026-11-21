import "server-only";

export async function getBetterAuthJwt(headers: Headers) {
  const baseUrl =
    process.env.BETTER_AUTH_URL ??
    "http://localhost:3000";

  const cookie = headers.get("cookie") ?? "";
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/auth/token`, {
    method: "GET",
    headers: {
      cookie,
    },
    cache: "no-store",
  });

  if (!response.ok) return null;

  const data = (await response.json()) as { token?: string };
  return data.token ?? null;
}
