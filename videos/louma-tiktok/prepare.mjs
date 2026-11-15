import { copyFile, mkdir } from "node:fs/promises";

const assetDirectory = new URL("./assets/", import.meta.url);
await mkdir(new URL("files/", assetDirectory), { recursive: true });

const sources = {
  "louma.svg": "../../public/louma.svg",
  "ar-1.png": "../../public/demo/ar-1.png",
  "ar-2.png": "../../public/demo/ar-2.png",
  "cairo.css": "../../node_modules/@fontsource-variable/cairo/wght.css",
  "gsap.min.js": "../../node_modules/gsap/dist/gsap.min.js",
};

for (const subset of ["arabic", "latin", "latin-ext"]) {
  const file = `files/cairo-${subset}-wght-normal.woff2`;
  sources[file] = `../../node_modules/@fontsource-variable/cairo/${file}`;
}

await Promise.all(
  Object.entries(sources).map(([name, source]) =>
    copyFile(new URL(source, import.meta.url), new URL(name, assetDirectory)),
  ),
);
