import type { Stage } from "@/lib/store";

type StepStatus = "done" | "active" | "pending";

const STEPS = [
  { label: "문서 글자 읽기", activeLabel: "문서 글자 읽는 중…", tag: "GPT 1차" },
  { label: "개인정보 가리기", activeLabel: "개인정보 가리는 중…", tag: null },
  { label: "쉬운 말로 바꾸기", activeLabel: "쉬운 말로 바꾸는 중…", tag: "GPT 2차" },
  { label: "할 일 정리하기", activeLabel: "할 일 정리하는 중…", tag: null },
] as const;

/**
 * 실제 진행과 맞춘다:
 * extracting → 1단계 진행 (GPT 1차 + 마스킹은 /api/extract 한 번에 끝남)
 * explaining → 1·2단계 완료, 3단계 진행
 * done       → 전부 완료
 */
export function stepStatuses(stage: Stage): StepStatus[] {
  switch (stage) {
    case "extracting":
      return ["active", "pending", "pending", "pending"];
    case "explaining":
      return ["done", "done", "active", "pending"];
    case "done":
      return ["done", "done", "done", "done"];
    default:
      return ["pending", "pending", "pending", "pending"];
  }
}

export function ProgressSteps({ stage }: { stage: Stage }) {
  const statuses = stepStatuses(stage);
  return (
    <ol className="flex flex-col gap-4" aria-label="진행 단계">
      {STEPS.map((step, i) => {
        const status = statuses[i];
        return (
          <li key={step.label} className="flex items-center gap-3" aria-current={status === "active" ? "step" : undefined}>
            <span
              className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                status === "done"
                  ? "bg-green-500 text-white"
                  : status === "active"
                    ? "bg-brand text-white motion-safe:animate-pulse"
                    : "bg-slate-100 text-slate-400"
              }`}
              aria-hidden
            >
              {status === "done" ? "✓" : i + 1}
            </span>
            <span
              className={`flex-1 ${
                status === "active" ? "font-bold text-slate-900" : status === "done" ? "text-slate-800" : "text-slate-400"
              }`}
            >
              {status === "active" ? step.activeLabel : step.label}
              <span className="sr-only">
                {status === "done" ? " (완료)" : status === "active" ? " (진행 중)" : " (대기)"}
              </span>
            </span>
            {step.tag && <span className="text-xs text-slate-400">{step.tag}</span>}
          </li>
        );
      })}
    </ol>
  );
}
