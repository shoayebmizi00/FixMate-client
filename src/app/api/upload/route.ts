import { NextResponse } from "next/server";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: Request) {
  const apiKey = process.env.IMAGEBB_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Image uploads are not configured." },
      { status: 500 }
    );
  }

  if (!request.headers.get("content-type")?.includes("multipart/form-data")) {
    return NextResponse.json({ error: "No image was provided." }, { status: 400 });
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "No image was provided." }, { status: 400 });
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No image was provided." }, { status: 400 });
  }

  if (!ACCEPTED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Unsupported image type. Use JPG, PNG, WEBP or GIF." },
      { status: 415 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Image must be 5 MB or smaller." },
      { status: 413 }
    );
  }

  const body = new FormData();
  body.append("image", Buffer.from(await file.arrayBuffer()).toString("base64"));
  body.append("name", `fixmate-avatar-${Date.now()}`);

  let payload: {
    success?: boolean;
    data?: { url?: string; thumb?: { url?: string } };
    error?: { message?: string };
  } | null = null;

  try {
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
      { method: "POST", body, cache: "no-store" }
    );

    payload = await response.json();

    if (!response.ok || !payload?.success || !payload.data?.url) {
      return NextResponse.json(
        { error: payload?.error?.message ?? "Image upload failed." },
        { status: 502 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Could not reach the image service. Try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    url: payload.data.url,
    thumbnail: payload.data.thumb?.url ?? payload.data.url,
  });
}
