import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "TOM IN THE WATER";

async function loadFont(weight: number): Promise<ArrayBuffer> {
  const res = await fetch(
    `https://cdn.jsdelivr.net/npm/@fontsource/archivo/files/archivo-latin-${weight}-normal.woff`,
  );
  return res.arrayBuffer();
}

// 공유 미리보기 카드 — 사이트와 동일한 Archivo 사용 (한글은 satori 미지원 → 영문)
export default async function OpengraphImage() {
  const [regular, semibold] = await Promise.all([loadFont(400), loadFont(600)]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0b0d0e",
          color: "#ece9e3",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 90px",
          fontFamily: "Archivo",
          backgroundImage:
            "radial-gradient(120% 90% at 70% 0%, #0f3a4a 0%, #0b0d0e 60%)",
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 400,
            letterSpacing: 12,
            textTransform: "uppercase",
            color: "#7cc4d3",
          }}
        >
          Underwater Photography
        </div>
        <div
          style={{
            fontSize: 74,
            fontWeight: 600,
            letterSpacing: 7,
            marginTop: 22,
          }}
        >
          TOM IN THE WATER
        </div>
        <div
          style={{
            fontSize: 30,
            fontWeight: 400,
            color: "rgba(236,233,227,0.62)",
            marginTop: 22,
            maxWidth: 840,
          }}
        >
          Capturing the journey to another self, found in a different world
          underwater.
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Archivo", data: regular, weight: 400, style: "normal" },
        { name: "Archivo", data: semibold, weight: 600, style: "normal" },
      ],
    },
  );
}
