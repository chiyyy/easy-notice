import { formatAmount, formatShortDate } from "./format";
import { MASK } from "./mask";
import type { Dday, ExplainResponse } from "./schema";

/** D-day 표시를 소리로 읽기 좋은 말로 ("D-10" → "10일 남았어요") */
export function ddayToSpeech(dday: Dday): string {
  if (dday.daysLeft > 0) return `${dday.daysLeft}일 남았어요.`;
  if (dday.daysLeft === 0) return "오늘까지예요.";
  return "기한이 지났어요.";
}

/** 읽어 줄 문장 정리: 가려진 개인정보는 "가려진 정보"로, 문장 끝에 마침표 */
function clean(text: string): string {
  const t = text.split(MASK).join("가려진 정보").replace(/\s+/g, " ").trim();
  return /[.?!]$/.test(t) ? t : `${t}.`;
}

/**
 * 요약 탭 내용을 소리로 읽을 문장 목록으로 만든다.
 * 순서: 문서 종류 → 3줄 요약 → 기한·금액 → 해야 할 일 → 주의할 점.
 * 문장마다 따로 읽어야 브라우저가 긴 글을 중간에 끊지 않는다.
 */
export function buildSpeechLines(
  docLabel: string,
  explain: Pick<ExplainResponse, "summary" | "fields" | "dday" | "todos" | "warnings">,
): string[] {
  const lines: string[] = [`${docLabel} 내용이에요.`];
  lines.push(...explain.summary.map(clean));

  const { deadline, amount } = explain.fields;
  if (deadline) {
    lines.push(`기한은 ${formatShortDate(deadline)}이에요.${explain.dday ? ` ${ddayToSpeech(explain.dday)}` : ""}`);
  }
  if (amount !== null) lines.push(`금액은 ${formatAmount(amount)}이에요.`);

  if (explain.todos.length > 0) {
    lines.push("해야 할 일이에요.");
    explain.todos.forEach((todo, i) => lines.push(`${i + 1}. ${clean(todo.task)}`));
  }
  if (explain.warnings.length > 0) {
    lines.push("주의할 점이에요.");
    lines.push(...explain.warnings.map(clean));
  }
  return lines;
}
