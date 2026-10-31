// Synthetic document only. Run: node --env-file=.env.local scripts/smoke-llama-ocr.mjs
import assert from "node:assert/strict";
import { extractDocument } from "../lib/llama-ocr.ts";

const stream =
  "BT /F1 18 Tf 50 750 Td (TEST DOCUMENT - SYNTHETIC) Tj 0 -30 Td (Name: TEST PERSON) Tj 0 -30 Td (CNIE: AB123456) Tj 0 -30 Td (Address: 123 Test Street, Rabat) Tj ET";
const objects = [
  "<< /Type /Catalog /Pages 2 0 R >>",
  "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
  "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
];
let pdf = "%PDF-1.4\n";
const offsets = [0];
objects.forEach((object, i) => {
  offsets.push(Buffer.byteLength(pdf));
  pdf += `${i + 1} 0 obj\n${object}\nendobj\n`;
});
const xref = Buffer.byteLength(pdf);
pdf += `xref\n0 6\n0000000000 65535 f \n${offsets
  .slice(1)
  .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
  .join("")}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
const started = Date.now();
try {
  const fields = await extractDocument(
    new File([pdf], "synthetic-test.pdf", { type: "application/pdf" }),
    ["name", "identity", "address"],
    AbortSignal.timeout(60000),
  );
  assert.equal(fields.identity, "AB123456");
  assert.equal(fields.name, "TEST PERSON");
  assert.match(fields.address, /Rabat/i);
  console.log(
    JSON.stringify({ success: true, durationMs: Date.now() - started, fields }),
  );
} catch (error) {
  // Provider error bodies can contain document data; print safe diagnostics only.
  console.error(
    JSON.stringify({
      success: false,
      error: error.name,
      status: error.status,
      durationMs: Date.now() - started,
    }),
  );
  process.exitCode = 1;
}
