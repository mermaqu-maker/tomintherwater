import Link from "next/link";

export default function NotFound() {
  return (
    <section className="min-h-[72vh] flex flex-col items-center justify-center text-center px-6 pt-[74px]">
      <p className="font-[family-name:var(--font-en)] text-[11px] tracking-[0.4em] uppercase text-accent mb-5">
        404
      </p>
      <h1 className="font-medium text-[clamp(19px,2.2vw,24px)] tracking-[-0.01em]">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="text-tx2 mt-3 text-sm max-w-[360px]">
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
