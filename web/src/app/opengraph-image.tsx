import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "TOM IN THE WATER";

// 공유 미리보기 카드 (한글은 기본 폰트 미지원 → 영문으로)
export default function OpengraphImage() {
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
          backgroundImage:
            "radial-gradient(120% 90% at 70% 0%, #0f3a4a 0%, #0b0d0e 60%)",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 12,
            textTransform: "uppercase",
            color: "#7cc4d3",
          }}
        >
          Underwater Photography
        </div>
        <div style={{ fontSize: 76, fontWeight: 700, marginTop: 22, letterSpacing: -1 }}>
          TOM IN THE WATER
        </div>
        <div
          style={{
            fontSize: 30,
            color: "rgba(236,233,227,0.62)",
            marginTop: 20,
            maxWidth: 820,
          }}
        >
          Capturing the journey to another self, found in a different world
          underwater.
        </div>
      </div>
    ),
    { ...size },
  );
}
