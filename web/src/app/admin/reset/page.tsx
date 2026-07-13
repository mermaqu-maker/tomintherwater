"use client";

import { useActionState } from "react";
import { updatePassword, type AuthState } from "../actions";

const field =
  "w-full bg-bg2 border border-line text-tx text-sm px-3.5 py-3 font-[300] placeholder:text-tx3 focus:outline-none focus:border-line2";

export default function ResetPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    updatePassword,
    null,
  );
  return (
    <section className="min-h-[70vh] flex items-center justify-center px-6 py-[140px]">
      <div className="w-full max-w-[380px]">
        <div className="text-center mb-[26px]">
          <div className="font-en font-semibold tracking-[0.16em]">
            TOM IN THE WATER
          </div>
          <div className="text-tx3 text-xs mt-1.5">새 비밀번호 설정</div>
        </div>
        <form action={action}>
          <label className="block text-[11px] tracking-[0.1em] uppercase text-tx3 mb-1.5">
            새 비밀번호
          </label>
          <input
            name="password"
            type="password"
            className={`${field} mb-3`}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          <label className="block text-[11px] tracking-[0.1em] uppercase text-tx3 mb-1.5">
            새 비밀번호 확인
          </label>
          <input
            name="confirm"
            type="password"
            className={`${field} mb-[18px]`}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          {state?.error && (
            <p className="text-[13px] text-red-400 mb-3">{state.error}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="cta-solid w-full justify-center disabled:opacity-50"
          >
            비밀번호 변경
          </button>
        </form>
      </div>
    </section>
  );
}
