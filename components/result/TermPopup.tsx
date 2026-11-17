"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { ExplainResponse } from "@/lib/schema";

type Term = ExplainResponse["terms"][number];

/**
 * 용어 풀이 바텀 시트. 브라우저 기본 <dialog>를 써서
 * 포커스 가두기·Esc로 닫기·배경 클릭 막기를 직접 구현하지 않아도 된다.
 */
export function TermPopup({ term, onClose }: { term: Term | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (term && !dialog.open) dialog.showModal();
    if (!term && dialog.open) dialog.close();
  }, [term]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      // 시트 바깥(배경)을 누르면 닫기
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="term-title"
      className="fixed inset-x-0 top-auto bottom-0 mx-auto mb-0 w-full max-w-[430px] rounded-t-2xl bg-white p-0 text-ink backdrop:bg-black/40"
    >
      {term && (
        <div className="px-5 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <div className="flex items-start justify-between gap-4">
            <h2 id="term-title" className="text-display font-bold">
              {term.word}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="-mt-1 -mr-2 flex size-11 shrink-0 items-center justify-center rounded-lg text-sub hover:bg-canvas"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>
          <p className="mt-3 text-heading leading-relaxed">{term.meaning}</p>
          {term.example && (
            <div className="mt-5 border-t border-line pt-4">
              <p className="text-label font-medium text-muted">예시</p>
              <p className="mt-1 text-body leading-relaxed text-sub">{term.example}</p>
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}
