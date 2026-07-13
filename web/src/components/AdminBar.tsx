import Link from "next/link";
import { getAdmin } from "@/lib/auth";
import { signOut } from "@/app/admin/actions";

// 로그인된 관리자에게만 하단 고정 바 노출
export default async function AdminBar() {
  const admin = await getAdmin();
  if (!admin) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-60 bg-[#06171d] border-t border-[rgba(124,196,211,0.28)] text-tx flex items-center gap-3 px-6 py-3 text-xs tracking-[0.06em]">
      <span className="w-[7px] h-[7px] rounded-full bg-accent inline-block" />
      관리자 · {admin.email}
      <span className="ml-auto flex gap-5 items-center">
        <Link href="/admin/projects" className="text-tx2 hover:text-tx uppercase tracking-[0.1em]">
          프로젝트 관리
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="text-tx2 hover:text-tx uppercase tracking-[0.1em] cursor-pointer"
          >
            로그아웃
          </button>
        </form>
      </span>
    </div>
  );
}
