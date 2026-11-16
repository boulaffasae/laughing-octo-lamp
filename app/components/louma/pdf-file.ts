export type PdfFile = {
  name: string;
  load: (signal: AbortSignal) => Promise<Blob>;
};

export async function fetchPdf(url: string, signal: AbortSignal) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw Error();
  return response.blob();
}

export const contractPdfName = "Contrat de location.pdf";

export function downloadPdf(url: string, name: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
}
