"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ProjectComment } from "@/lib/project";
import {
  addComment,
  editComment,
  deleteComment,
  adminDeleteComment,
} from "./actions";

const field =
  "w-full bg-bg border border-line text-tx text-sm px-3.5 py-3 font-[300] placeholder:text-tx3 focus:outline-none focus:border-line2";

export default function Comments({
  projectId,
  slug,
  initial,
  isAdmin = false,
}: {
  projectId: string;
  slug: string;
  initial: ProjectComment[];
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<{ id: string; mode: "edit" | "delete" } | null>(null);

  function submitNew() {
    setError(null);
    start(async () => {
      const r = await addComment({ projectId, slug, nickname, password, body });
      if (!r.ok) return setError(r.error ?? "오류가 발생했습니다.");
      setNickname("");
      setPassword("");
      setBody("");
      router.refresh();
    });
  }

  return (
    <div className="mt-20 pt-11 border-t border-line">
      <p className="font-en text-[11px] tracking-[0.34em] uppercase text-accent mb-3">
        Comments
      </p>

      {/* 목록 */}
      <div className="flex flex-col">
        {initial.length === 0 ? (
          <p className="text-tx3 text-sm py-4">이 프로젝트에 첫 댓글을 남겨보세요.</p>
        ) : (
          initial.map((c) => (
            <CommentRow
              key={c.id}
              comment={c}
              slug={slug}
              isAdmin={isAdmin}
              active={active?.id === c.id ? active.mode : null}
              setActive={setActive}
              onDone={() => {
                setActive(null);
                router.refresh();
              }}
              pending={pending}
              start={start}
            />
          ))
        )}
      </div>

      {/* 작성 폼 */}
      <div className="mt-6">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input
            className={field}
            placeholder="닉네임"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <input
            className={field}
            type="password"
            placeholder="비밀번호 (수정/삭제 시 필요)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <textarea
          className={field}
          rows={2}
          placeholder="이 프로젝트에 댓글 남기기…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        {error && <p className="text-[13px] text-red-400 mt-2">{error}</p>}
        <div className="flex justify-end mt-3">
          <button
            type="button"
            onClick={submitNew}
            disabled={pending}
            className="btn-line disabled:opacity-50"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}

function CommentRow({
  comment,
  slug,
  isAdmin,
  active,
  setActive,
  onDone,
  pending,
  start,
}: {
  comment: ProjectComment;
  slug: string;
  isAdmin: boolean;
  active: "edit" | "delete" | null;
  setActive: (v: { id: string; mode: "edit" | "delete" } | null) => void;
  onDone: () => void;
  pending: boolean;
  start: (cb: () => void) => void;
}) {
  const [pw, setPw] = useState("");
  const [text, setText] = useState(comment.body);
  const [err, setErr] = useState<string | null>(null);

  const date = new Date(comment.created_at).toLocaleDateString("ko-KR");

  function doDelete() {
    setErr(null);
    start(async () => {
      const r = await deleteComment({ commentId: comment.id, slug, password: pw });
      if (!r.ok) return setErr(r.error ?? "오류");
      setPw("");
      onDone();
    });
  }
  function doEdit() {
    setErr(null);
    start(async () => {
      const r = await editComment({ commentId: comment.id, slug, password: pw, body: text });
      if (!r.ok) return setErr(r.error ?? "오류");
      setPw("");
      onDone();
    });
  }

  return (
    <div className="py-[18px] border-b border-line">
      <div className="flex justify-between items-start gap-3">
        <span className="text-[13px] text-tx">{comment.nickname}</span>
        <span className="flex gap-2.5 text-[11px] text-tx3">
          <button
            type="button"
            className="hover:text-tx cursor-pointer"
            onClick={() => setActive(active === "edit" ? null : { id: comment.id, mode: "edit" })}
          >
            수정
          </button>
          <button
            type="button"
            className="hover:text-red-400 cursor-pointer"
            onClick={() => setActive(active === "delete" ? null : { id: comment.id, mode: "delete" })}
          >
            삭제
          </button>
          {isAdmin && (
            <button
              type="button"
              className="text-red-400/80 hover:text-red-400 cursor-pointer"
              onClick={() =>
                start(async () => {
                  await adminDeleteComment(comment.id, slug);
                  onDone();
                })
              }
            >
              ✕ 관리자
            </button>
          )}
        </span>
      </div>
      <p className="text-tx2 text-sm mt-1">{comment.body}</p>
      <p className="text-tx3 text-[11px] mt-1.5">{date}</p>

      {active === "delete" && (
        <div className="flex gap-2 mt-3">
          <input
            className={field}
            type="password"
            placeholder="비밀번호 확인"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
          <button type="button" onClick={doDelete} disabled={pending} className="btn-line whitespace-nowrap disabled:opacity-50">
            삭제
          </button>
        </div>
      )}
      {active === "edit" && (
        <div className="mt-3">
          <textarea className={field} rows={2} value={text} onChange={(e) => setText(e.target.value)} />
          <div className="flex gap-2 mt-2">
            <input
              className={field}
              type="password"
              placeholder="비밀번호 확인"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
            <button type="button" onClick={doEdit} disabled={pending} className="btn-line whitespace-nowrap disabled:opacity-50">
              저장
            </button>
          </div>
        </div>
      )}
      {err && <p className="text-[13px] text-red-400 mt-2">{err}</p>}
    </div>
  );
}
