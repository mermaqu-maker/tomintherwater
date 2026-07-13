import Link from "next/link";

export default function NotFound() {
  return (
    <section className="min-h-[72vh] flex flex-col items-center justify-center text-center px-6 pt-[74px]">
      <p className="font-[family-name:var(--font-en)] text-[11px] tracking-[0.4em] uppercase text-accent mb-5">
        404
      </p>
      <h1 className="font-[family-name:var(--font-en)] font-semibold text-[clamp(28px,4vw,46px)] tracking-[-0.02em]">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="text-tx2 mt-4 max-w-[360px]">
        주소가 바뀌었거나 삭제된 페이지일 수 있어요.
      </p>
      <div className="flex gap-3 mt-9">
        <Link href="/" className="btn-line">
          홈으로
        </Link>
        <Link href="/gallery" className="btn-line">
          갤러리
        </Link>
      </div>
    </section>
  );
}
