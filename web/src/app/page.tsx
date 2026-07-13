// 홈 — 히어로 + Featured Work (콘텐츠는 이 두 섹션만, docs/01 §2.1)
// M1: 레이아웃/토큰 검증용 플레이스홀더. M2에서 Supabase featured_projects 연동.
export default function Home() {
  return (
    <>
      {/* 히어로 — 이미지가 무대. 실제 배경(영상/대표작)은 M2에서 */}
      <section className="relative h-screen min-h-[620px] overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(155deg,#08202c,#0f465b_60%,#08202c)]" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,transparent_55%,rgba(0,0,0,0.45))]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,13,14,0.55)_0%,transparent_26%,transparent_46%,rgba(11,13,14,0.5)_78%,rgba(11,13,14,0.96)_100%),linear-gradient(90deg,rgba(11,13,14,0.5),transparent_42%)]" />

        <div className="absolute left-0 right-0 bottom-[8vh] z-[2]">
          <div className="max-w-[1180px] mx-auto px-8">
            <p className="font-[family-name:var(--font-en)] text-[11px] tracking-[0.42em] uppercase text-accent mb-[22px]">
              Underwater Photography
            </p>
            <h1 className="font-[family-name:var(--font-en)] font-semibold text-[clamp(28px,7vw,74px)] leading-[1.05] md:leading-[1.02] tracking-[-0.022em]">
              A journey underwater
              <br />
              to meet another Me.
            </h1>
            <p className="mt-[22px] max-w-[440px] text-[15px] text-tx2">
              물이라는 다른 차원에서 만나는 또 다른 나. 그 여정을 기록합니다.
            </p>
          </div>
        </div>

        {/* 스크롤 표시 — 우측 세로 (mockup v0.2) */}
        <div className="absolute right-9 top-1/2 -translate-y-1/2 z-[2] flex flex-col items-center gap-4 text-tx3">
          <span className="[writing-mode:vertical-rl] font-[family-name:var(--font-en)] text-[10px] tracking-[0.3em] uppercase">
            Scroll
          </span>
          <span className="w-px h-[60px] bg-line2" />
        </div>
      </section>

      {/* Featured Work — M2에서 Masonry + hover 오버레이로 대체 */}
      <section className="border-t border-line py-[120px]">
        <div className="max-w-[1180px] mx-auto px-8">
          <div className="flex justify-between items-baseline mb-11">
            <div>
              <p className="font-[family-name:var(--font-en)] text-[11px] tracking-[0.34em] uppercase text-accent">
                Selected
              </p>
              <h2 className="font-[family-name:var(--font-en)] font-semibold text-[clamp(26px,3.2vw,40px)] tracking-[-0.015em] mt-1.5">
                Featured Work
              </h2>
            </div>
            <span className="font-[family-name:var(--font-en)] text-[11px] tracking-[0.2em] uppercase text-tx3">
              In / On the Water
            </span>
          </div>
          <p className="text-tx3 text-sm">
            M2에서 Supabase 연동 후 대표 작업이 여기에 표시됩니다.
          </p>
        </div>
      </section>
    </>
  );
}
