"use client";

import { useActionState, useState } from "react";
import { signIn, requestReset, type AuthState } from "../actions";

const field =
  "w-full bg-bg2 border border-line text-tx text-sm px-3.5 py-3 font-[300] placeholder:text-tx3 focus:outline-none focus:border-line2";

export default function AdminLoginPage() {
  const [mode, setMode] = useState<"login" | "forgot">("login");

  return (
    <section className="min-h-[70vh] flex items-center justify-center px-6 py-[140px]">
      <div className="w-full max-w-[380px]">
        <div className="text-center mb-[26px]">
          <div className="font-en font-semibold tracking-[0.16em]">
            TOM IN THE WATER
          </div>
          <div className="text-tx3 text-xs mt-1.5">
            {mode === "login" ? "관리자 로그인 · /admin" : "비밀번호 재설정"}
          </div>
        </div>

        {mode === "login" ? (
          <LoginForm onForgot={() => setMode("forgot")} />
        ) : (
          <ForgotForm onBack={() => setMode("login")} />
        )}
      </div>
    </section>
  );
}

function LoginForm({ onForgot }: { onForgot: () => void }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    signIn,
    null,
  );
  return (
    <form action={action}>
      <label className="block text-[11px] tracking-[0.1em] uppercase text-tx3 mb-1.5">
        이메일
      </label>
      <input
        name="email"
        type="email"
        className={`${field} mb-3`}
        placeholder="owner@tominthewater.com"
        autoComplete="username"
      />
      <label className="block text-[11px] tracking-[0.1em] uppercase text-tx3 mb-1.5">
        비밀번호
      </label>
      <input
        name="password"
        type="password"
        className={`${field} mb-[18px]`}
        placeholder="••••••••"
        autoComplete="current-password"
      />
      {state?.error && (
        <p className="text-[13px] text-red-400 mb-3">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="cta-solid w-full justify-center disabled:opacity-50"
      >
        {pending ? "확인 중…" : "로그인"}
      </button>
      <div className="text-center mt-3.5">
        <button
          type="button"
          onClick={onForgot}
          className="text-tx3 text-xs underline"
        >
          비밀번호를 잊으셨나요?
        </button>
      </div>
    </form>
  );
}

function ForgotForm({ onBack }: { onBack: () => void }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    requestReset,
    null,
  );
  if (state?.sent) {
    return (
      <p className="text-tx2 text-sm text-center">
        재설정 링크를 이메일로 보냈습니다. 메일의 링크로 접속해 새 비밀번호를
        설정하세요.
        <button
          type="button"
          onClick={onBack}
          className="block mx-auto mt-4 text-tx3 text-xs underline"
        >
          로그인으로
        </button>
      </p>
    );
  }
  return (
    <form action={action}>
      <label className="block text-[11px] tracking-[0.1em] uppercase text-tx3 mb-1.5">
        이메일
      </label>
      <input
        name="email"
        type="email"
        className={`${field} mb-[18px]`}
        placeholder="owner@tominthewater.com"
      />
      {state?.error && (
        <p className="text-[13px] text-red-400 mb-3">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="cta-solid w-full justify-center disabled:opacity-50"
      >
        재설정 링크 보내기
      </button>
      <div className="text-center mt-3.5">
        <button
          type="button"
          onClick={onBack}
          className="text-tx3 text-xs underline"
        >
          로그인으로
        </button>
      </div>
    </form>
  );
}
