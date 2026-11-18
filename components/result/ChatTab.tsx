"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ChatEntry } from "@/lib/use-chat";

type Props = {
  entries: ChatEntry[];
  pending: boolean;
  suggestions: string[];
  onSend: (question: string) => void;
};

/** 질문하기 탭: 문서 내용만 근거로 답하고, 답 아래에 근거 원문 문장을 보여 준다 */
export function ChatTab({ entries, pending, suggestions, onSend }: Props) {
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  // 새 메시지가 생기면 맨 아래로
  useEffect(() => {
    if (entries.length > 0 || pending) endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [entries.length, pending]);

  function submit(text: string) {
    if (!text.trim() || pending) return;
    onSend(text);
    setDraft("");
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 px-5 pt-2 pb-4">
        {entries.length === 0 && (
          <section aria-labelledby="chat-intro">
            <h2 id="chat-intro" className="text-heading font-bold">
              이 문서에 대해 물어보세요
            </h2>
            <p className="mt-1 text-label leading-relaxed text-muted">
              문서에 적힌 내용으로만 답해요. 답 아래에 근거가 된 문장을 함께 보여 드려요.
            </p>
            <ul className="mt-5 flex flex-col items-start gap-2" aria-label="추천 질문">
              {suggestions.map((q) => (
                <li key={q}>
                  <button
                    type="button"
                    onClick={() => submit(q)}
                    disabled={pending}
                    className="min-h-11 rounded-full border border-line px-4 text-body text-ink hover:bg-canvas disabled:opacity-50"
                  >
                    {q}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <ol className="flex flex-col gap-4" aria-live="polite" aria-label="대화">
          {entries.map((e, i) => (
            <li key={i} className={e.role === "user" ? "flex justify-end" : "flex justify-start"}>
              {e.role === "user" && (
                <p className="max-w-[85%] rounded-2xl rounded-br-md bg-brand px-4 py-2.5 text-body leading-relaxed text-white">
                  <span className="sr-only">내 질문: </span>
                  {e.content}
                </p>
              )}
              {e.role === "assistant" && (
                <div className="max-w-[90%]">
                  <p className="rounded-2xl rounded-bl-md bg-canvas px-4 py-2.5 text-body leading-relaxed">
                    <span className="sr-only">답: </span>
                    {e.content}
                  </p>
                  {e.evidence && (
                    <p className="mt-2 border-l-2 border-line pl-3 text-label leading-relaxed text-muted">
                      <span className="mr-1.5 font-medium text-sub">근거</span>
                      {e.evidence}
                    </p>
                  )}
                </div>
              )}
              {e.role === "error" && (
                <p role="alert" className="max-w-[90%] text-label text-sub">
                  {e.content}
                </p>
              )}
            </li>
          ))}
          {pending && (
            <li className="flex justify-start">
              <p className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-canvas px-4 py-2.5 text-body text-sub">
                <span
                  className="size-4 rounded-full border-2 border-line border-t-brand motion-safe:animate-spin"
                  aria-hidden
                />
                답을 찾고 있어요
              </p>
            </li>
          )}
        </ol>
        <div ref={endRef} />
      </div>

      {/* 입력창: 하단 탭 바로 위에 붙어 있다 */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(draft);
        }}
        className="sticky bottom-[calc(3.5rem+env(safe-area-inset-bottom))] flex items-center gap-2 border-t border-line bg-white px-4 py-3"
      >
        <label htmlFor="chat-input" className="sr-only">
          궁금한 점
        </label>
        <input
          id="chat-input"
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={500}
          placeholder="궁금한 점을 물어보세요"
          enterKeyHint="send"
          autoComplete="off"
          className="h-12 min-w-0 flex-1 rounded-full bg-canvas px-4 text-body placeholder:text-muted focus-visible:outline-2"
        />
        <button
          type="submit"
          disabled={pending || !draft.trim()}
          aria-label="보내기"
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand text-white hover:bg-brand-strong disabled:bg-line disabled:text-muted"
        >
          <ArrowUp className="size-5" strokeWidth={2.5} aria-hidden />
        </button>
      </form>
    </div>
  );
}
