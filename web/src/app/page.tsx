// 홈 — 히어로 + Featured Work (콘텐츠는 이 두 섹션만, docs/01 §2.1)
import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import { getFeatured, getFeaturableProjects } from "@/lib/featured";
import { getAdmin } from "@/lib/auth";
import FeaturedManager, { Tile } from "@/components/FeaturedManager";

export default async function Home() {
  const [featured, admin] = await Promise.all([getFeatured(), getAdmin()]);
  const featurable = admin ? await getFeaturableProjects() : [];
  const showFeatured = admin || featured.length > 0;

  return (
    <>
      {/* 히어로 — 배경 사진이 무대 (인물 상단 고정 · full-bleed) */}
      <section className="relative h-screen min-h-[620px] overflow-hidden bg-[#08202c]">
        <Image
          src="/hero/mermaid-hero.jpg"
          alt="깊은 바다 협곡에 앉은 인어 — TOM in the water"
          fill
          priority
          sizes="100vw"
          quality={85}
          className="object-cover object-[50%_30%]"
        />
        {/* 상단 비네트 + 텍스트 가독성/시네마틱 오버레이 */}
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,transparent_55%,rgba(0,0,0,0.45))]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,13,14,0.5)_0%,transparent_26%,transparent_46%,rgba(11,13,14,0.5)_72%,rgba(11,13,14,0.99)_100%),linear-gradient(90deg,rgba(11,13,14,0.5),transparent_44%)]" />
        {/* 하단 솔리드 페이드 — 사진 워터마크 마스킹 + 다음 섹션 연결 (모바일 가독성) */}
        <div className="absolute inset-x-0 bottom-0 h-[22%] bg-[linear-gradient(0deg,var(--bg)_2%,transparent)]" />

        <div className="absolute left-0 right-0 bottom-[8vh] z-[2]">
          <div className="max-w-[1180px] mx-auto px-8">
            <Reveal>
              <p className="font-[family-name:var(--font-en)] text-[11px] tracking-[0.42em] uppercase text-accent mb-[22px]">
                Underwater Photography
              </p>
            </Reveal>
            <Reveal delay={120}>
              <h1 className="font-[family-name:var(--font-en)] font-semibold text-[clamp(23px,3.1vw,40px)] leading-[1.18] md:leading-[1.12] tracking-[-0.015em] max-w-[880px]">
                Capturing the journey to another self,
                <br className="hidden sm:block" /> found in a different world
                underwater.
              </h1>
            </Reveal>
            <Reveal delay={260}>
              <p className="mt-[22px] max-w-[540px] text-[15px] text-tx2">
                물속이라는 다른 세상에서 마주한 또 다른 나, 그 여정을 담아냅니다.
              </p>
            </Reveal>
          </div>
        </div>

        {/* 스크롤 표시 — 우측 세로 (mockup v0.2) */}
        <div className="absolute right-9 top-1/2 -translate-y-1/2 z-[2] flex flex-col items-center gap-4 text-tx3">
          <span className="[writing-mode:vertical-rl] font-[family-name:var(--font-en)] text-[10px] tracking-[0.3em] uppercase">
            Scroll
          </span>
          <span className="relative block w-px h-[60px] bg-line2 overflow-hidden">
            <span className="absolute inset-x-0 top-0 h-1/2 bg-accent animate-[scrollCue_2.2s_ease-in-out_infinite]" />
          </span>
        </div>
      </section>

      {/* Featured Work — featured_projects 연동 (관리자 −/＋ 관리) */}
      {showFeatured && (
        <section className="border-t border-line py-[120px]">
          <div className="max-w-[1180px] mx-auto px-8">
            <Reveal>
              <div className="flex justify-between items-baseline mb-11">
                <div>
                  <p className="font-[family-name:var(--font-en)] text-[11px] tracking-[0.34em] uppercase text-accent">
                    Selected
                  </p>
                  <h2 className="font-[family-name:var(--font-en)] font-semibold text-[clamp(26px,3.2vw,40px)] tracking-[-0.015em] mt-1.5">
                    Featured Work
                  </h2>
                </div>
                <Link
                  href="/gallery"
                  className="font-[family-name:var(--font-en)] text-[11px] tracking-[0.2em] uppercase text-tx3 hover:text-accent transition-colors"
                >
                  갤러리 전체 보기 →
                </Link>
              </div>
            </Reveal>

            {admin ? (
              <FeaturedManager featured={featured} featurable={featurable} />
            ) : (
              <div className="grid gap-[22px] sm:grid-cols-2">
                {featured.map((c, i) => (
                  <Reveal key={c.projectId} delay={Math.min(i, 4) * 80}>
                    <Tile card={c} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
