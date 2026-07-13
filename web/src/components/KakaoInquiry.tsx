import { KAKAO_CHANNEL_URL } from "@/lib/links";

// 페이지 하단 문의 블록 (상품 페이지 등). 전역 플로팅과 별개로 명시적 CTA.
export default function KakaoInquiry({
  title = "촬영 문의는 카카오톡으로 주세요",
  sub = "일정·의상·장소 상담을 편하게 도와드립니다.",
}: {
  title?: string;
  sub?: string;
}) {
  return (
    <section className="border-t border-line py-[100px]">
      <div className="max-w-[1180px] mx-auto px-8 text-center">
        <h2 className="font-en font-semibold text-[clamp(22px,2.8vw,32px)] tracking-[-0.015em]">
          {title}
        </h2>
        <p className="text-tx2 text-sm mt-3">{sub}</p>
        <a
          href={KAKAO_CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="cta-solid mt-8"
        >
          문의하기
        </a>
      </div>
    </section>
  );
}
