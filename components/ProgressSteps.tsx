import { Check } from "lucide-react";
import type { Stage } from "@/lib/store";

type StepStatus = "done" | "active" | "pending";

// tag는 발표 때 구조(GPT 1차·2차)를 보여 주기 위한 작은 보조 표시
const STEPS = [
  { label: "문서 글자 읽기", tag: "GPT 1차" },
  { label: "개인정보 가리기", tag: null },
  { label: "쉬운 말로 바꾸기", tag: "GPT 2차" },
  { label: "할 일 정리하기", tag: null },
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

function StepMark({ status }: { status: StepStatus }) {
  if (status === "done") return <Check className="size-5 text-brand" strokeWidth={2.5} aria-hidden />;
  if (status === "active")
    return (
      <span
        className="size-4 rounded-full border-2 border-line border-t-brand motion-safe:animate-spin"
        aria-hidden
      />
    );
  return <span className="size-1.5 rounded-full bg-line" aria-hidden />;
}

export function ProgressSteps({ stage }: { stage: Stage }) {
  const statuses = stepStatuses(stage);
  return (
    <ol aria-label="진행 단계">
      {STEPS.map((step, i) => {
        const status = statuses[i];
        return (
          <li
            key={step.label}
            className="flex min-h-12 items-center gap-3"
            aria-current={status === "active" ? "step" : undefined}
          >
            <span className="flex size-6 shrink-0 items-center justify-center">
              <StepMark status={status} />
            </span>
            <span
              className={`flex-1 text-body ${
                status === "active" ? "font-semibold text-ink" : status === "done" ? "text-ink" : "text-muted"
              }`}
            >
              {step.label}
              <span className="sr-only">
                {status === "done" ? " (완료)" : status === "active" ? " (진행 중)" : " (대기)"}
              </span>
            </span>
            {step.tag && <span className="text-caption text-muted">{step.tag}</span>}
          </li>
        );
      })}
    </ol>
  );
}
