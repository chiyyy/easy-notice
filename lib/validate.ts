// 5단계 검증·후처리: GPT 2차 결과를 1차(원문) 값과 코드로 비교한다. 순수 함수.
import type { ExplainLlm, Fields } from "./schema";

// ───────── 날짜 ─────────

/** 글 속 날짜를 "MM-DD"로 모은다 (연도는 쉬운 말에서 자주 빠지므로 월·일만 비교) */
export function findDates(text: string): Set<string> {
  const found = new Set<string>();
  const add = (m: string | number, d: string | number) => {
    const mm = Number(m);
    const dd = Number(d);
    if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) {
      found.add(`${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`);
    }
  };
  for (const m of text.matchAll(/(?<!\d)\d{4}-(\d{1,2})-(\d{1,2})(?!\d)/g)) add(m[1], m[2]); // 2026-11-30
  for (const m of text.matchAll(/(?<!\d)\d{4}\.\s?(\d{1,2})\.\s?(\d{1,2})(?!\d)/g)) add(m[1], m[2]); // 2026. 11. 30
  for (const m of text.matchAll(/(?<!\d)(\d{1,2})월\s?(\d{1,2})일/g)) add(m[1], m[2]); // 11월 30일
  for (const m of text.matchAll(/(?<![\d./])(\d{1,2})\/(\d{1,2})(?![\d/])/g)) add(m[1], m[2]); // 11/30
  return found;
}

// ───────── 금액 ─────────

const UNIT: Record<string, number> = { 억: 100_000_000, 만: 10_000, 천: 1_000, 백: 100 };

/** "3만 2천 원" → 32000, "40,000원" → 40000 */
export function parseKoreanAmount(span: string): number | null {
  let total = 0;
  let seen = false;
  for (const m of span.matchAll(/([\d,]+)\s?(억|만|천|백)?/g)) {
    const n = Number(m[1].replace(/,/g, ""));
    if (!Number.isFinite(n) || m[1].replace(/,/g, "") === "") continue;
    total += m[2] ? n * UNIT[m[2]] : n;
    seen = true;
  }
  return seen ? total : null;
}

/** 글 속 금액(원 단위)을 모은다 */
export function findAmounts(text: string): Set<number> {
  const found = new Set<number>();
  const re = /\d[\d,]*\s?(?:억|만|천|백)?(?:\s?\d[\d,]*\s?(?:억|만|천|백)?)*\s?원/g;
  for (const m of text.matchAll(re)) {
    const n = parseKoreanAmount(m[0]);
    if (n !== null && n > 0) found.add(n);
  }
  return found;
}

// ───────── 후처리 ─────────

export type ExplainCheck = {
  /** 후처리된 GPT 결과 */
  result: ExplainLlm;
  /** 원문에 없는 날짜·금액이 나왔으면 true */
  mismatchWarning: boolean;
};

/**
 * - terms: maskedText에 실제로 없는 단어는 제거
 * - 날짜·금액: 요약·할 일에 원문(maskedText + 1차 fields)에 없는 값이 있으면 mismatchWarning.
 *   할 일의 due가 원문에 없는 날짜면 null로 지운다(화면의 기한 카드는 1차 값을 그대로 쓴다).
 */
export function checkExplain(llm: ExplainLlm, maskedText: string, fields: Fields): ExplainCheck {
  const sourceDates = findDates(maskedText);
  if (fields.deadline) findDates(fields.deadline).forEach((d) => sourceDates.add(d));
  const sourceAmounts = findAmounts(maskedText);
  if (fields.amount !== null) sourceAmounts.add(fields.amount);

  let mismatch = false;
  const generated = [...llm.summary, ...llm.todos.map((t) => t.task)].join("\n");
  for (const d of findDates(generated)) if (!sourceDates.has(d)) mismatch = true;
  for (const a of findAmounts(generated)) if (!sourceAmounts.has(a)) mismatch = true;

  const todos = llm.todos.map((t) => {
    if (t.due === null) return t;
    const [due] = [...findDates(t.due)];
    if (due && sourceDates.has(due)) return t;
    mismatch = true;
    return { ...t, due: null };
  });

  const terms = llm.terms.filter((t) => t.word.trim() !== "" && maskedText.includes(t.word));

  return { result: { ...llm, todos, terms }, mismatchWarning: mismatch };
}

// ───────── 질문하기 근거 ─────────

const squash = (s: string) => s.replace(/\s+/g, " ").trim();

/**
 * GPT가 준 근거 문장이 원문에 실제로 있는지 확인한다(공백 차이는 무시).
 * 원문에 없으면(고쳐 쓴 문장 등) 잘못된 근거를 보여 주지 않도록 null.
 */
export function verifyEvidence(evidence: string | null, maskedText: string): string | null {
  if (!evidence) return null;
  const cleaned = squash(evidence.replace(/^["'“”‘’「」『』]+|["'“”‘’「」『』]+$/g, ""));
  if (cleaned.length < 2) return null;
  return squash(maskedText).includes(cleaned) ? cleaned : null;
}

// ───────── 번역 ─────────

/** 번역문 속 숫자들 ("32,000 won", "32.000 won", "32 000" → 32000) */
function numbersIn(text: string): Set<number> {
  const found = new Set<number>();
  for (const m of text.matchAll(/\d[\d,.  ]*\d|\d/g)) found.add(Number(m[0].replace(/\D/g, "")));
  return found;
}

/**
 * 한국어 문장의 금액이 번역문에도 같은 숫자로 들어 있는지 문장 짝마다 확인한다.
 * ("3만 2천 원" → 번역문에 32000이 있어야 함). 하나라도 빠지면 false.
 */
export function amountsKept(sources: string[], translated: string[]): boolean {
  return sources.every((src, i) => {
    const amounts = findAmounts(src);
    if (amounts.size === 0) return true;
    const nums = numbersIn(translated[i] ?? "");
    return [...amounts].every((a) => nums.has(a));
  });
}

/**
 * 번역문 괄호 속 한국어 원어가 한국어 원문에 실제로 있는 말인지 확인하고,
 * 없으면(예: "意见진술서"처럼 섞여 나온 경우) 그 괄호를 지운다.
 */
export function cleanKoreanGloss(translated: string, source: string): string {
  return translated
    .replace(/\s?[(（]([^()（）]*[가-힣][^()（）]*)[)）]/g, (whole, inner: string) => {
      const words = inner.split(/[,，、·]/).map((w) => w.trim());
      return words.every((w) => /^[가-힣\s]+$/.test(w) && source.includes(w)) ? whole : "";
    })
    .trim();
}
