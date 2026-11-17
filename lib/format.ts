import type { DocType } from "./schema";

const DOC_TYPE_LABEL: Record<DocType, string> = {
  bill: "고지서",
  contract: "계약서",
  notice: "안내문",
  medical: "병원 안내문",
  other: "문서",
};

export function docTypeLabel(docType: DocType): string {
  return DOC_TYPE_LABEL[docType];
}

/** 32000 → "32,000원" */
export function formatAmount(amount: number): string {
  return `${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}원`;
}

/** "2026-11-30" → "11월 30일" (Date 객체를 쓰지 않아 시간대 영향이 없다) */
export function formatShortDate(isoDate: string): string {
  const [, m, d] = isoDate.split("-").map(Number);
  return `${m}월 ${d}일`;
}

export type TextPart = { text: string; strong: boolean };

// 날짜(2026-11-30, 11월 30일까지)와 금액(40,000원, 4만 원, 3만 2천 원)
const HIGHLIGHT_RE =
  /(\d{4}-\d{2}-\d{2}|\d{1,2}월\s?\d{1,2}일(?:까지)?|\d[\d,]*\s?(?:만|천)?(?:\s?\d+\s?(?:천|백))?\s?원)/g;

/** 요약 문장에서 날짜·금액을 강조할 수 있게 조각낸다 */
export function splitHighlights(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let last = 0;
  for (const match of text.matchAll(HIGHLIGHT_RE)) {
    const start = match.index ?? 0;
    if (start > last) parts.push({ text: text.slice(last, start), strong: false });
    parts.push({ text: match[0], strong: true });
    last = start + match[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), strong: false });
  return parts;
}
