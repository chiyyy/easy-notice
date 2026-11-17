import type { Level } from "@/lib/schema";

const OPTIONS: { value: Level; label: string }[] = [
  { value: "easy", label: "아주 쉽게" },
  { value: "normal", label: "보통" },
];

/** 설명 수준 세그먼트 (아주 쉽게 / 보통) */
export function LevelToggle({
  value,
  onChange,
  disabled,
}: {
  value: Level;
  onChange: (level: Level) => void;
  disabled?: boolean;
}) {
  return (
    <fieldset disabled={disabled}>
      <legend className="mb-2 text-sm text-slate-600">설명 수준</legend>
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
        {OPTIONS.map((opt) => {
          const selected = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(opt.value)}
              className={`min-h-11 rounded-lg font-medium ${
                selected ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
