// Small server-only helper for calling the Express data API.
// The browser never sees BASE_API_URL; every mutation goes through a Next
// route handler first.

export function baseApiUrl() {
  const baseUrl = process.env.BASE_API_URL;
  if (!baseUrl) throw new Error("BASE_API_URL is not configured.");
  return baseUrl.replace(/\/$/, "");
}

export async function apiFetch(path: string, init?: RequestInit) {
  const response = await fetch(`${baseApiUrl()}${path}`, {
    cache: "no-store",
    ...init,
  });

  const data: unknown = await response.json().catch(() => ({}));

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}

export function errorMessage(data: unknown, fallback: string) {
  if (
    typeof data === "object" &&
    data !== null &&
    typeof (data as { error?: unknown }).error === "string"
  ) {
    return (data as { error: string }).error;
  }

  return fallback;
}
