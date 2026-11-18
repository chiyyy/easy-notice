// 원문에서 용어(terms.word)와 가린 개인정보("[개인정보]")를 찾아 조각낸다. 순수 함수.
import { MASK } from "./mask";

export type SourcePart =
  | { kind: "text"; text: string }
  | { kind: "term"; text: string; termIndex: number }
  | { kind: "mask"; text: string };

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 긴 용어부터 맞춰서 겹치지 않게 모든 위치를 표시한다.
 * (예: "과태료 금액"과 "과태료"가 둘 다 있으면 "과태료 금액"이 먼저)
 */
export function splitByTerms(text: string, words: string[]): SourcePart[] {
  const indexOf = new Map<string, number>();
  words.forEach((w, i) => {
    if (w.trim() !== "" && !indexOf.has(w)) indexOf.set(w, i);
  });
  const patterns = [...indexOf.keys()].sort((a, b) => b.length - a.length).map(escapeRegExp);
  patterns.unshift(escapeRegExp(MASK));
  const re = new RegExp(patterns.join("|"), "g");

  const parts: SourcePart[] = [];
  let last = 0;
  for (const m of text.matchAll(re)) {
    const start = m.index ?? 0;
    if (start > last) parts.push({ kind: "text", text: text.slice(last, start) });
    if (m[0] === MASK) parts.push({ kind: "mask", text: m[0] });
    else parts.push({ kind: "term", text: m[0], termIndex: indexOf.get(m[0]) ?? 0 });
    last = start + m[0].length;
  }
  if (last < text.length) parts.push({ kind: "text", text: text.slice(last) });
  return parts;
}

/**
 * 용어가 처음 나오는 원문 줄을 짧게 잘라 돌려준다("문서에서는 이렇게 쓰였어요"용).
 * 가린 개인정보는 "(가린 정보)"로 바꿔 읽기 쉽게 한다.
 */
export function findContext(text: string, word: string, radius = 24): string | null {
  if (word.trim() === "") return null;
  const line = text.split("\n").find((l) => l.includes(word));
  if (!line) return null;
  let snippet = line.trim();
  const idx = snippet.indexOf(word);
  if (snippet.length > word.length + radius * 2) {
    const start = Math.max(0, idx - radius);
    const end = Math.min(snippet.length, idx + word.length + radius);
    snippet = `${start > 0 ? "…" : ""}${snippet.slice(start, end)}${end < snippet.length ? "…" : ""}`;
  }
  return snippet.split(MASK).join("(가린 정보)");
}
