import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import { KAKAO_CHANNEL_URL, INSTAGRAM_URL } from "@/lib/links";

export const metadata: Metadata = {
  title: "About",
  description:
    "물속이라는 다른 세상에서 또 다른 나를 담는 언더워터 포토그래퍼 TOM.",
};

const CREDITS: { heading: string; items: string[] }[] = [
  {
    heading: "촬영 분야",
    items: [
      "수중 프로필 · 컨셉 화보 (Editorial)",
      "머메이드 · 드레스 · 코스프레 언더워터",
      "이벤트 · 상업 · 브랜드 협업",
    ],
  },
  {
    heading: "촬영 장소",
    items: ["포프라자", "딥스테이션", "MS 다이빙풀", "웨이브파크 블루라군홀 (여름 한정)"],
  },
  {
    heading: "협업 · 브랜드",
    items: ["언더워터웨어 브랜드 MOONSHORE", "머메이드 · 프리다이빙 크루", "개인 · 커플 · 단체 촬영"],
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="border-t border-line pt-[150px] pb-[110px]">
        <div className="max-w-[900px] mx-auto px-8">
          <Reveal>
            <p className="font-en text-[11px] tracking-[0.34em] uppercase text-accent">
              About
            </p>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="font-en font-semibold text-[clamp(28px,4vw,52px)] leading-[1.1] tracking-[-0.02em] mt-4 max-w-[720px]">
              물속에서 만나는
              <br />또 다른 나를 담습니다.
            </h1>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-9 space-y-5 text-[15px] leading-[1.9] text-tx2 max-w-[640px]">
              <p>
                TOM은 물속이라는 낯선 세상에서 피어나는 순간을 기록하는 언더워터
                포토그래퍼입니다. 중력이 사라진 공간에서 몸은 자유로워지고, 표정은
                평소와 다른 결을 갖습니다. 그 찰나의 또 다른 나를 사진으로
                남깁니다.
              </p>
              <p>
                수영복 프로필부터 머메이드·드레스·컨셉 화보, 브랜드 협업과 이벤트
                촬영까지 — 물이라는 무대 위에서 사람과 이야기를 담아 왔습니다.
                안전한 진행과 섬세한 디렉팅으로, 물이 처음인 분도 온전히 자신을
                맡길 수 있게 돕습니다.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-line py-[90px]">
        <div className="max-w-[900px] mx-auto px-8 grid gap-12 md:grid-cols-3">
          {CREDITS.map((col, i) => (
            <Reveal key={col.heading} delay={i * 100}>
              <div>
                <h2 className="font-en text-[11px] tracking-[0.2em] uppercase text-tx3 mb-4">
                  {col.heading}
                </h2>
                <ul className="space-y-2.5">
                  {col.items.map((it) => (
                    <li key={it} className="text-[14px] text-tx2 leading-relaxed">
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-line py-[100px]">
        <div className="max-w-[900px] mx-auto px-8 text-center">
          <Reveal>
            <p className="font-en text-[11px] tracking-[0.28em] uppercase text-accent mb-4">
              Contact
            </p>
            <h2 className="font-en font-semibold text-[clamp(22px,2.8vw,32px)] tracking-[-0.015em]">
              함께 물속 이야기를 남겨요
            </h2>
            <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
              <a
                href={KAKAO_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="cta-solid"
              >
                카카오톡 문의
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-line"
              >
                @tom_freedive
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
