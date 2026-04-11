/** Browser image uploads (hosted URL returned for product/shop images). */

function clean(v: string | undefined): string {
  let s = (v ?? "").trim();
  s = s.replace(/,+$/g, "");
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  s = s.replace(/,+$/g, "");
  return s;
}

export function getCloudinaryCloudName(): string {
  return clean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
}

export function getCloudinaryUploadPreset(): string {
  return clean(process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(getCloudinaryCloudName() && getCloudinaryUploadPreset());
}

/** Upload one image; returns an HTTPS URL. */
export async function uploadImageToCloudinary(
  file: File,
  options: { folder?: string } = {}
): Promise<string> {
  const cloudName = getCloudinaryCloudName();
  const uploadPreset = getCloudinaryUploadPreset();
  if (!cloudName || !uploadPreset) {
    throw new Error("Image upload is not available right now.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  if (options.folder) {
    formData.append("folder", options.folder);
  }

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  const payload = (await res.json().catch(() => ({}))) as {
    secure_url?: string;
    error?: { message?: string };
  };

  if (!res.ok) {
    throw new Error(
      payload.error?.message || `Image upload failed (${res.status}).`
    );
  }

  if (!payload.secure_url) {
    throw new Error("Upload did not return an image URL.");
  }

  return payload.secure_url;
}
