"use client";

import type { Level } from "@/lib/schema";
import { useAnalysis } from "@/lib/store";

const OPTIONS: { value: Level; label: string; hint: string }[] = [
  { value: "easy", label: "아주 쉽게", hint: "짧고 쉬운 말로" },
  { value: "normal", label: "보통", hint: "용어에 뜻을 덧붙여" },
];

/** 설명 수준 선택 (아주 쉽게 / 보통) */
export function LevelToggle() {
  const { level, setLevel } = useAnalysis();
  return (
    <fieldset>
      <legend className="mb-3 text-label font-semibold">설명 수준</legend>
      <div className="grid grid-cols-2 gap-2">
        {OPTIONS.map((opt) => {
          const selected = opt.value === level;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={selected}
              onClick={() => setLevel(opt.value)}
              className={`flex min-h-11 flex-col items-start rounded-xl border px-4 py-3 text-left ${
                selected ? "border-brand bg-brand-soft" : "border-line"
              }`}
            >
              <span className={`text-body font-semibold ${selected ? "text-brand" : "text-ink"}`}>
                {opt.label}
              </span>
              <span className="mt-0.5 text-caption text-muted">{opt.hint}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
