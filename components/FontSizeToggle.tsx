"use client";

import { useAnalysis } from "@/lib/store";

/** 가 / 가+ : 큰 글씨 모드 켜고 끄기 */
export function FontSizeToggle() {
  const { largeText, setLargeText } = useAnalysis();
  return (
    <button
      type="button"
      onClick={() => setLargeText(!largeText)}
      aria-pressed={largeText}
      aria-label={largeText ? "글씨 보통 크기로" : "글씨 크게 보기"}
      className="min-h-11 min-w-11 rounded-lg px-2 text-slate-700 hover:bg-slate-100"
    >
      <span className={largeText ? "text-slate-400" : "font-bold text-slate-900"}>가</span>
      <span className="mx-0.5 text-slate-300">/</span>
      <span className={largeText ? "font-bold text-slate-900" : "text-slate-400"}>가+</span>
    </button>
  );
}
