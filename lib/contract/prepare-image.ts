import { MAX_FILE_BYTES } from "../upload-policy";

export async function prepareImage(
  input: File,
  { maxSide, output }: { maxSide: number; output: "image/png" | "image/jpeg" },
) {
  if (
    !["image/png", "image/jpeg", "image/webp"].includes(input.type) ||
    !input.size ||
    input.size > MAX_FILE_BYTES
  )
    throw Error("Unsupported image");

  const image = await createImageBitmap(input);
  try {
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw Error("Canvas unavailable");
    if (output === "image/jpeg") {
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return {
      src: canvas.toDataURL(output, 0.85),
      width: canvas.width,
      height: canvas.height,
    };
  } finally {
    image.close();
  }
}
