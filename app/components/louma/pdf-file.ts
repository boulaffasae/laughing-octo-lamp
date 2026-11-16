export const contractPdfName = "Contrat de location.pdf";

export function downloadPdf(url: string, name: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
}
