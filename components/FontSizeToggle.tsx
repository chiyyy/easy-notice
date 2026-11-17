"use client";

import { useAnalysis } from "@/lib/store";

/** 큰 글씨 모드 켜고 끄기 */
export function FontSizeToggle() {
  const { largeText, setLargeText } = useAnalysis();
  return (
    <button
      type="button"
      onClick={() => setLargeText(!largeText)}
      aria-pressed={largeText}
      className={`min-h-11 rounded-lg px-3 text-label font-medium ${
        largeText ? "text-brand" : "text-sub"
      } hover:bg-canvas`}
    >
      큰 글씨{largeText ? " 켜짐" : ""}
    </button>
  );
}
