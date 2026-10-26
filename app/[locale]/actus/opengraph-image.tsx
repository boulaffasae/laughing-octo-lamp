import { ImageResponse } from "next/og";
export const alt = "Louma — Guides de location de voiture au Maroc";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#fbfbf6",
        color: "#263c36",
        width: "100%",
        height: "100%",
        padding: 80,
      }}
    >
      <div style={{ fontSize: 64, fontWeight: 700 }}>louma.</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontSize: 24, color: "#356451" }}>
          LE JOURNAL DE LA LOCATION
        </div>
        <div style={{ fontSize: 68, maxWidth: 900 }}>
          Bien préparer sa location au Maroc.
        </div>
      </div>
      <div style={{ fontSize: 24, color: "#356451" }}>
        GUIDES / CONSEILS / BUDGET
      </div>
    </div>,
    size,
  );
}
