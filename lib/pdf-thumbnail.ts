import { createRequire } from "node:module";
import { dirname, join, sep } from "node:path";

const require = createRequire(import.meta.url);

export async function renderPdfThumbnail(data: Uint8Array) {
  const [{ createCanvas }, { getDocument }] = await Promise.all([
    import("@napi-rs/canvas"),
    import("pdfjs-dist/legacy/build/pdf.mjs"),
  ]);
  const assets = dirname(require.resolve("pdfjs-dist/package.json"));
  const loading = getDocument({
    data,
    cMapUrl: join(assets, "cmaps") + sep,
    standardFontDataUrl: join(assets, "standard_fonts") + sep,
    wasmUrl: join(assets, "wasm") + sep,
    iccUrl: join(assets, "iccs") + sep,
    useWorkerFetch: false,
    maxImageSize: 16_000_000,
    canvasMaxAreaInBytes: 64_000_000,
  });

  try {
    const pdf = await loading.promise;
    const page = await pdf.getPage(1);
    const size = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({
      scale: 320 / Math.max(size.width, size.height),
    });
    const canvas = createCanvas(
      Math.max(1, Math.ceil(viewport.width)),
      Math.max(1, Math.ceil(viewport.height)),
    );
    // PDF.js accepts the native Node canvas at runtime.
    await page.render({
      canvas: canvas as unknown as HTMLCanvasElement,
      viewport,
      background: "#fff",
    }).promise;
    return await canvas.encode("webp", 82);
  } finally {
    await loading.destroy();
  }
}
