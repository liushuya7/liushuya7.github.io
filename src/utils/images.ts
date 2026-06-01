import type { ImageMetadata } from "astro";

const allImages = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/**/*.{jpeg,jpg,JPEG,JPG,png,PNG,gif,GIF,webp,WEBP,svg,SVG}",
);

const normalizeAssetPath = (value: string): string =>
  value.replace(/\\/g, "/").replace(/\/+/g, "/").trim();

const caseInsensitiveImageLookup = new Map(
  Object.entries(allImages).map(([path, resolver]) => [path.toLowerCase(), resolver]),
);

/**
 * Dynamically resolves a local asset image object from a string filename or path.
 * @param photoUrl - The filename (e.g., 'avatar.jpg') or full path from JSON data
 * @returns The resolved ImageMetadata object, or null if not found
 */

export async function resolveAssetImage(
  photoUrl: string | undefined,
): Promise<ImageMetadata | null> {
  if (!photoUrl || photoUrl.trim() === "") {
    return null;
  }

  // Normalize path format and recover from case-only path mismatches.
  const normalizedInput = normalizeAssetPath(photoUrl);
  const imagePath = normalizedInput.startsWith("/src/assets/")
    ? normalizedInput
    : `/src/assets/${normalizedInput}`;

  const imageResolver =
    allImages[imagePath] ?? caseInsensitiveImageLookup.get(imagePath.toLowerCase());

  if (!imageResolver) {
    console.warn(`[Image Utility] Asset not found for path: ${imagePath}`);
    return null;
  }

  try {
    const imageModule = await imageResolver();
    return imageModule.default;
  } catch (error) {
    console.error(`[Image Utility] Failed to load image at ${imagePath}`, error);
    return null;
  }
}
